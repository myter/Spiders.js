import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 26/01/2017.
 */
export class NatTrapezoidalApproximationBench extends SpiderBenchmark{
    masterRef
    workerRefs

    constructor(){
        super("Native Trapezoidal Approximation","Native Trapezoidal Approximation cycle completed","Native Trapezoidal Approximation completed","Native Trapezoidal Approximation scheduled")
        this.workerRefs = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var actorsExited        = 0
        var that                = this

        function sysHandle(event){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.trapezoidWorkers + 1){
                    that.masterRef.postMessage(["work"])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function actorExit(){
                actorsExited += 1
                if(actorsExited == (BenchConfig.trapezoidWorkers + 1)){
                    that.stopPromise.resolve()
                }
            }

            switch(event.data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "actorExit":
                    actorExit()
                    break;
                default :
                    console.log("Unknown message (System): " + event.data[0])
            }
        }

        that.masterRef = that.spawnWorker(require('./TrapezoidalApproximationMaster.js'))
        that.masterRef.onmessage = sysHandle
        var precision = (BenchConfig.trapezoidRight - BenchConfig.trapezoidLeft) / BenchConfig.trapezoidPieces
        that.masterRef.postMessage(["config",BenchConfig.trapezoidLeft,BenchConfig.trapezoidRight,precision])
        var id = 0
        for(var i = 0;i < BenchConfig.trapezoidWorkers;i++){
            var workerRef = that.spawnWorker(require('./TrapezoidalApproximationWorker.js'))
            that.workerRefs.push(workerRef)
            workerRef.onmessage = sysHandle
            var chan = new MessageChannel()
            that.masterRef.postMessage(["newWorker"],[chan.port2])
            workerRef.postMessage(["config",id],[chan.port1])
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