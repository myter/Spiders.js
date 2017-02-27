import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 26/01/2017.
 */
export class NatNQueensFirstNSolutionsBench extends SpiderBenchmark{
    masterRef
    allWorkers

    constructor(){
        super("Native N Queens First N Solutions","Native N Queens First N Solutions cycle completed","Native N Queens First N Solutions completed","Native N Queens First N Solutions scheduled")
        this.allWorkers = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(event){
            function checkConfig(){
                if(actorsInitialised == 1 + BenchConfig.nQueensWorkers){
                    that.masterRef.postMessage(["start"])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function end(){
                that.stopPromise.resolve()
            }

            switch(event.data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "end":
                    end()
                    break;
                default :
                    console.log("Unknown message (System): " + event.data[0])
            }
        }

        that.masterRef = that.spawnWorker(require('./NQueensFirstNSolutionsMaster.js'))
        that.masterRef.onmessage = sysHandle
        that.masterRef.postMessage(["config",BenchConfig.nQueensSolutions,BenchConfig.nQueensPriorities,BenchConfig.nQueensWorkers])
        var id = 0
        for(var i = 0;i < BenchConfig.nQueensWorkers;i++){
            var workerRef = that.spawnWorker(require('./NQueensFirstNSolutionsWorker.js'))
            that.allWorkers.push(workerRef)
            workerRef.onmessage = sysHandle
            var chan = new MessageChannel()
            workerRef.postMessage(["config",id,BenchConfig.nQueensThreshold,BenchConfig.nQueensSize],[chan.port1])
            that.masterRef.postMessage(["addWorker",id],[chan.port2])
            id += 1
        }
        that.masterRef.postMessage(["configDone"])
    }

    cleanUp(){
        this.allWorkers.push(this.masterRef)
        this.cleanWorkers(this.allWorkers)
        this.allWorkers = []
    }
}