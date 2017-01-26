import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 26/01/2017.
 */
export class NatPrecisePiComputationBench extends SpiderBenchmark{
    masterRef
    workerRefs

    constructor(){
        super("Native Precise Pi Computation","Native Precise Pi Computation cycle completed","Native Precise Pi Computation completed","Native Precise Pi Computation scheduled")
        this.workerRefs = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(event){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.piPrecisionWorkers + 1){
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

        that.masterRef = that.spawnWorker(require('./PrecisePiComputationMaster.js'))
        that.masterRef.onmessage = sysHandle
        that.masterRef.postMessage(["config",BenchConfig.piPrecisionWorkers,BenchConfig.piPrecisionPrecision])
        var id = 0
        for(var i = 0;i < BenchConfig.piPrecisionWorkers;i++){
            var workerRef = that.spawnWorker(require('./PrecisePiComputationWorker.js'))
            that.workerRefs.push(workerRef)
            workerRef.onmessage = sysHandle
            var chan = new MessageChannel()
            that.masterRef.postMessage(["newWorker",id],[chan.port1])
            workerRef.postMessage(["config",id],[chan.port2])
            id += 1
        }
        that.masterRef.postMessage(["configDone"])
    }

    cleanUp(){
        this.workerRefs.push(this.masterRef)
        this.cleanWorkers(this.workerRefs)
        this.workerRefs = []
    }
}