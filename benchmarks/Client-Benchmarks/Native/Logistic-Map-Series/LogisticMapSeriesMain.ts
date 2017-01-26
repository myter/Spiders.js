import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 26/01/2017.
 */
export class NatLogisticMapSeriesBench extends SpiderBenchmark{
    masterRef
    computers
    workers

    constructor(){
        super("Native Logistic Map Series","Native Logistic Map Series cycle completed","Native Logistic Map Series completed","Native Logistic Map Series scheduled")
        this.computers  = []
        this.workers    = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(event){
            function checkConfig(){
                if(actorsInitialised == (BenchConfig.logMapSeries *  2) +  1){
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
                    console.log("Unknown message: " + event.data[0])
            }
        }

        that.masterRef = that.spawnWorker(require('./LogisticMapSeriesMaster.js'))
        that.masterRef.onmessage = sysHandle
        var compCount 	= BenchConfig.logMapSeries - 1
        while(compCount >= 0){
            var newComp = that.spawnWorker(require('./LogisticMapSeriesRate.js'))
            newComp.onmessage = sysHandle
            var rate = BenchConfig.logMapStartRate + (compCount * BenchConfig.logMapIncrement)
            newComp.postMessage(["config",rate])
            that.computers.push(newComp)
            compCount -= 1
        }
        var workCount 	= BenchConfig.logMapSeries - 1
        while(workCount >= 0){
            var newWork = that.spawnWorker(require('./LogisticMapSeriesSeries.js'))
            newWork.onmessage = sysHandle
            var masChan = new MessageChannel()
            that.masterRef.postMessage(["newWorker",BenchConfig.logMapSeries,BenchConfig.logMapTerms],[masChan.port1])
            var raterRef = that.computers[workCount % that.computers.length]
            var rateChan = new MessageChannel()
            raterRef.postMessage(["link"],[rateChan.port1])
            newWork.postMessage(["linkMaster"],[masChan.port2])
            newWork.postMessage(["linkRate"],[rateChan.port2])
            var startTerm 		= workCount * BenchConfig.logMapIncrement
            newWork.postMessage(["config",startTerm])
            that.workers.push(newWork)
            workCount -= 1
        }
    }

    cleanUp(){
        this.workers.push(this.masterRef)
        this.cleanWorkers(this.workers)
        this.cleanWorkers(this.computers)
        this.workers    = []
        this.computers  = []
    }
}