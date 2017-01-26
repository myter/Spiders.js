import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 26/01/2017.
 */
export class NatSieveOfEratosthenesBench extends SpiderBenchmark{
    producerRef
    filterRef
    spawned

    constructor(){
        super("Native Sieve of Eratosthenes","Native Sieve of Eratosthenes cycle comples","Native Sieve of Eratosthenes completed","Native Sieve of Eratosthenes scheduled")
        this.spawned = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(event){
            function checkConfig(){
                if(actorsInitialised == 2){
                    that.producerRef.postMessage(["start"])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function end(){
                that.stopPromise.resolve()
            }


            function spawnNew(id,initPrime,sender){
                var ref = that.spawnWorker(require('./SieveOfEratosthenesPrimeFilter.js'))
                that.spawned.push(ref)
                ref.onmessage = sysHandle
                ref.postMessage(["config",id,initPrime,BenchConfig.sieveLocal])
                var c = new MessageChannel()
                ref.postMessage(["link"],[c.port2])
                sender.postMessage(["newSpawned"],[c.port1])
            }

            switch(event.data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "end":
                    end()
                    break;
                case "spawnNew":
                    spawnNew(event.data[1],event.data[2],event.ports[0])
                    break;
                default :
                    console.log("Unknown message (System): " + event.data[0])
            }
        }
        that.filterRef = that.spawnWorker(require('./SieveOfEratosthenesPrimeFilter.js'))
        that.filterRef.onmessage = sysHandle
        that.filterRef.postMessage(["config",1,2,BenchConfig.sieveLocal])
        that.producerRef = that.spawnWorker(require('./SieveOfEratosthenesProducer.js'))
        that.producerRef.onmessage = sysHandle
        var c = new MessageChannel()
        that.filterRef.postMessage(["link"],[c.port2])
        that.producerRef.postMessage(["config",BenchConfig.sieveLimit],[c.port1])
    }


    cleanUp(){
        this.spawned.push(this.producerRef,this.filterRef)
        this.cleanWorkers(this.spawned)
        this.spawned = []
    }
}