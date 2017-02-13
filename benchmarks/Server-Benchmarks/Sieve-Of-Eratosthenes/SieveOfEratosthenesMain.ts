import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
export class NodeSieveOfEratosthenesBench extends SpiderBenchmark{
    static _PRODUCER_PORT_ = 8001
    static _FILTER_PORT_ = 8002
    lastPort = 8003
    producerRef : ClientBufferSocket
    filterRef : ClientBufferSocket
    spawned : Map<number,ClientBufferSocket>
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Sieve of Eratosthenes","Node Sieve of Eratosthenes cycle comples","Node Sieve of Eratosthenes completed","Node Sieve of Eratosthenes scheduled")
        this.spawned = new Map()
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == 2){
                    that.producerRef.emit(["start"])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function end(){
                that.stopPromise.resolve()
            }


            function spawnNew(id,initPrime,senderPort){
                var ref = that.spawnNode("Sieve-Of-Eratosthenes/SieveOfEratosthenesPrimeFilter",sysHandle,that.lastPort)
                that.spawned.set(that.lastPort,ref)
                ref.emit(["config",id,initPrime,BenchConfig.sieveLocal])
                ref.emit(["link",senderPort])
                var sender = that.spawned.get(senderPort)
                sender.emit(["newSpawned",that.lastPort])
                that.lastPort++
            }

            switch(data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "end":
                    end()
                    break;
                case "spawnNew":
                    spawnNew(data[1],data[2],data[3])
                    break;
                default :
                    console.log("Unknown message (System): " + data[0])
            }
        }
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        that.filterRef = that.spawnNode("Sieve-Of-Eratosthenes/SieveOfEratosthenesPrimeFilter",sysHandle,NodeSieveOfEratosthenesBench._FILTER_PORT_)
        that.filterRef.emit(["config",1,2,BenchConfig.sieveLocal])
        that.producerRef = that.spawnNode("Sieve-Of-Eratosthenes/SieveOfEratosthenesProducer",sysHandle,NodeSieveOfEratosthenesBench._PRODUCER_PORT_)
        that.filterRef.emit(["link",NodeSieveOfEratosthenesBench._PRODUCER_PORT_])
        that.producerRef.emit(["config",BenchConfig.sieveLimit,NodeSieveOfEratosthenesBench._FILTER_PORT_])
    }


    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.spawned = new Map()
    }
}