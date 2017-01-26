import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 26/01/2017.
 */
export class NatAStarSearchBench extends SpiderBenchmark{
    masterRef
    allWorkers

    constructor(){
        super("Native A Star Search","Native A Star Search cycle completed","Native A Star Search completed","Native A Star Search scheduled")
        this.allWorkers = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(event){
            function checkConfig(){
                if(actorsInitialised == 1 + BenchConfig.aStarWorkers){
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
        that.masterRef = that.spawnWorker(require('./AStarSearchMaster.js'))
        that.masterRef.onmessage = sysHandle
        that.masterRef.postMessage(["config",BenchConfig.aStarWorkers,BenchConfig.aStarGridSize])
        var id = 0
        for(var i = 0;i < BenchConfig.aStarWorkers;i++){
            var workerRef = that.spawnWorker(require('./AStarSearchWorker.js'))
            that.allWorkers.push(workerRef)
            workerRef.onmessage = sysHandle
            var chan = new MessageChannel()
            that.masterRef.postMessage(["addWorker",id],[chan.port2])
            workerRef.postMessage(["config",BenchConfig.aStarThreshold,BenchConfig.aStarGridSize],[chan.port1])
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