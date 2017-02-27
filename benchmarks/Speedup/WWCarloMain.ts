import {SpiderBenchmark, BenchConfig} from "../benchUtils";
/**
 * Created by flo on 20/02/2017.
 */
export class WWCarloBench extends SpiderBenchmark{
    workers
    constructor(){
        super("Web Worker Monte Carlo","Web Worker Monte Carlo cycle completed","Web Worker Monte Carlo completed","Web Worker Monte Carlo scheduled")
        this.workers = []
    }


    runBenchmark(){
        var resultsReceived = 0
        var that            = this
        //The only even received is the "result" event
        function messageHandler(event){
            resultsReceived += 1
            if(resultsReceived == BenchConfig.monteCarloWorkers){
                that.stopPromise.resolve()
            }
        }
        var work = require('webworkify')
        for(var i = 0;i < BenchConfig.monteCarloWorkers;i++){
            let act = work(require('./WWCarloWorker'))
            act.addEventListener('message',messageHandler)
            act.postMessage(["calc"])
        }
    }

    cleanUp(){
        this.cleanWorkers(this.workers)
        this.workers = []
    }
}