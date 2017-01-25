import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 25/01/2017.
 */





export class NatCountBench extends SpiderBenchmark{
    prodWorker
    countWorker
    constructor(){
        super("Native count","Native count cycle completed","Native count completed","Native count scheduled")
    }

    runBenchmark(){
        var prodInitialised =	false
        var countInitialised =	false
        var that = this
        function messageHandler(event){
            function checkConfig(){
                if(prodInitialised && countInitialised){
                    that.prodWorker.postMessage(["start"])
                }
            }

            function prodInit(){
                prodInitialised = true
                checkConfig()
            }

            function countInit(){
                countInitialised = true
                checkConfig()
            }

            function countsExhausted(){
                that.stopPromise.resolve()
            }
            switch(event.data[0]){

                case "prodInit":
                    prodInit()
                    break;
                case "countInit":
                    countInit()
                    break;
                case "countsExhausted":
                    countsExhausted()
                    break;
            }
        }

        this.prodWorker = this.spawnWorker(require('./CountProducer.js'))
        this.prodWorker.onmessage = messageHandler
        this.countWorker = this.spawnWorker(require('./CountCounter.js'))
        this.countWorker.onmessage = messageHandler
        var chan = new MessageChannel()
        this.prodWorker.postMessage(["config",BenchConfig.count],[chan.port1])
        this.countWorker.postMessage(["config",BenchConfig.count],[chan.port2])
    }

    cleanUp(){
        this.cleanWorkers([this.prodWorker,this.countWorker])
    }
}