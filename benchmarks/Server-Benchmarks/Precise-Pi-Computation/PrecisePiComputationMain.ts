import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
export class NodePrecisePiComputationBench extends SpiderBenchmark{
    static _MASTER_PORT_ = 8001
    lastPort = 8002
    masterRef : ClientBufferSocket
    workerRefs : Array<ClientBufferSocket>
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Precise Pi Computation","Node Precise Pi Computation cycle completed","Node Precise Pi Computation completed","Node Precise Pi Computation scheduled")
        this.workerRefs = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.piPrecisionWorkers + 1){
                    that.masterRef.emit(["start"])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function end(){
                that.stopPromise.resolve()
            }

            switch(data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "end":
                    end()
                    break;
                default :
                    console.log("Unknown message (System): " + data[0])
            }
        }
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        that.masterRef = that.spawnNode("Precise-Pi-Computation/PrecisePiComputationMaster",sysHandle,NodePrecisePiComputationBench._MASTER_PORT_)
        that.masterRef.emit(["config",BenchConfig.piPrecisionWorkers,BenchConfig.piPrecisionPrecision])
        var id = 0
        for(var i = 0;i < BenchConfig.piPrecisionWorkers;i++){
            var workerRef = that.spawnNode("Precise-Pi-Computation/PrecisePiComputationWorker",sysHandle,that.lastPort)
            that.workerRefs.push(workerRef)
            that.masterRef.emit(["newWorker",id,that.lastPort])
            workerRef.emit(["config",id,NodePrecisePiComputationBench._MASTER_PORT_])
            id += 1
            that.lastPort++
        }
        that.masterRef.emit(["configDone"])
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.workerRefs = []
    }
}