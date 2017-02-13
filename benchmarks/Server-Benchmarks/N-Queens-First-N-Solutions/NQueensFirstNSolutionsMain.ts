import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
export class NodeNQueensFirstNSolutionsBench extends SpiderBenchmark{
    static _MASTER_PORT_ = 8001
    lastPort = 8002
    masterRef : ClientBufferSocket
    allWorkers : Array<ClientBufferSocket>
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node N Queens First N Solutions","Node N Queens First N Solutions cycle completed","Node N Queens First N Solutions completed","Node N Queens First N Solutions scheduled")
        this.allWorkers = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == 1 + BenchConfig.nQueensWorkers){
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
        that.masterRef = that.spawnNode("N-Queens-First-N-Solutions/NQueensFirstNSolutionsMaster",sysHandle,NodeNQueensFirstNSolutionsBench._MASTER_PORT_)
        that.masterRef.emit(["config",BenchConfig.nQueensSolutions,BenchConfig.nQueensPriorities,BenchConfig.nQueensWorkers])
        var id = 0
        for(var i = 0;i < BenchConfig.nQueensWorkers;i++){
            var workerRef = that.spawnNode("N-Queens-First-N-Solutions/NQueensFirstNSolutionsWorker",sysHandle,that.lastPort)
            that.allWorkers.push(workerRef)
            workerRef.emit(["config",id,BenchConfig.nQueensThreshold,BenchConfig.nQueensSize,NodeNQueensFirstNSolutionsBench._MASTER_PORT_])
            that.masterRef.emit(["addWorker",id,that.lastPort])
            id += 1
            that.lastPort++
        }
        that.masterRef.emit(["configDone"])
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.allWorkers = []
    }
}