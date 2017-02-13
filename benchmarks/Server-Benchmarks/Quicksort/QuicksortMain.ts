import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
export class NodeQuicksortBench extends SpiderBenchmark{
    static _QUICK_PORT_ = 8001
    lastPort = 8002
    quickRef : ClientBufferSocket
    spawned : Map<number,ClientBufferSocket>
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Quicksort","Node Quicksort cycle completed","Node Quicksort completed","Node Quicksort scheduled")
        this.spawned = new Map()
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == 1){
                    that.quickRef.emit(["sort"])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function end(){
                that.stopPromise.resolve()
            }

            function spawnNew(position,parentPort){
                var qRef = that.spawnNode("Quicksort/QuicksortActor",sysHandle,that.lastPort)
                that.spawned.set(that.lastPort,qRef)
                qRef.emit(["config",true,BenchConfig.matMulWorkers,BenchConfig.matMulDataLength,BenchConfig.matMulThreshold,position,parentPort])
                var parentRef = that.spawned.get(parentPort)
                parentRef.emit(["childSpawned",position,that.lastPort])
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
                    spawnNew(data[1],data[2])
                    break;
                default :
                    console.log("Unknown message (System): " + data[0])
            }
        }
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        that.quickRef = that.spawnNode("Quicksort/QuicksortActor",sysHandle,NodeQuicksortBench._QUICK_PORT_)
        that.quickRef.emit(["config",false,BenchConfig.matMulWorkers,BenchConfig.matMulDataLength,BenchConfig.matMulThreshold,0,"INITIAL"])
        for(var i = 0;i < BenchConfig.matMulWorkers;i++){
            var data = Math.floor(Math.random() * (BenchConfig.matMulDataLength - 0) + 0) % BenchConfig.matMulDataLength
            that.quickRef.emit(["newData",data])
        }
        that.quickRef.emit(["configDone"])
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.spawned = new Map()
    }
}