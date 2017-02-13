import {ClientBufferSocket, SpiderBenchmark, BenchConfig, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
export class NodeRecursiveMatrixMultiplicationBench extends SpiderBenchmark{
    static _MASTER_PORT_ = 8001
    lastPort = 8002
    masterRef : ClientBufferSocket
    workerRefs : Array<ClientBufferSocket>
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Recursive Matrix Multiplication","Node Recursive Matrix Multiplication cycle completed","Node Recursive Matrix Multiplication completed","Node Recursive Matrix Multiplication scheduled")
        this.workerRefs = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.matMulWorkers + 1){
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
        that.masterRef = that.spawnNode("Recursive-Matrix-Multiplication/RecursiveMatrixMultiplicationMaster",sysHandle,NodeRecursiveMatrixMultiplicationBench._MASTER_PORT_)
        that.masterRef.emit(["config",BenchConfig.matMulWorkers,BenchConfig.matMulDataLength])
        var id = 0
        var workerRefs = []
        for(var i = 0;i < BenchConfig.matMulWorkers;i++){
            var workerRef = that.spawnNode("Recursive-Matrix-Multiplication/RecursiveMatrixMultiplicationWorker",sysHandle,that.lastPort)
            workerRefs.push(workerRef)
            that.masterRef.emit(["newWorker",id,that.lastPort])
            workerRef.emit(["config",id,BenchConfig.matMulThreshold,BenchConfig.matMulDataLength,NodeRecursiveMatrixMultiplicationBench._MASTER_PORT_])
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