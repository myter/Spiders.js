import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 25/01/2017.
 */
export class NatProducerConsumerBench extends SpiderBenchmark{
    producers
    managerRef

    constructor(){
        super("Native Producer Consumer","Native Producer Consumer cycle completed","Native Producer Consumer completed","Native Producer Consumer scheduled")
        this.producers = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandler(event){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.prodConProd + BenchConfig.prodConCon + 1){
                    for(var i in that.producers){
                        that.producers[i].postMessage(["produce"])
                    }
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

        that.managerRef = that.spawnWorker(require('./ProducerConsumerManager.js'))
        that.managerRef.onmessage = sysHandler
        that.managerRef.postMessage(["config",BenchConfig.prodConBuffer,BenchConfig.prodConCon,BenchConfig.prodConProd])
        var prodCount = BenchConfig.prodConProd
        while(prodCount > 0){
            var newProd = that.spawnWorker(require('./ProducerConsumerProducer.js'))
            newProd.onmessage = sysHandler
            var manChan = new MessageChannel()
            that.managerRef.postMessage(["link"],[manChan.port2])
            newProd.postMessage(["config",BenchConfig.prodConItems,BenchConfig.prodConProdCost],[manChan.port1])
            that.producers.push(newProd)
            prodCount -= 1
        }
        var consumers = []
        var conCount = BenchConfig.prodConCon
        while(conCount > 0){
            var newCon = that.spawnWorker(require('./ProducerConsumerConsumer.js'))
            newCon.onmessage = sysHandler
            var manChan = new MessageChannel()
            that.managerRef.postMessage(["link"],[manChan.port2])
            newCon.postMessage(["config",BenchConfig.prodConProdCost],[manChan.port1])
            consumers.push(newCon)
            var conChan = new MessageChannel()
            newCon.postMessage(["link"],[conChan.port2])
            that.managerRef.postMessage(["registerConsumer"],[conChan.port1])
            conCount -= 1
        }
    }

    cleanUp(){
        this.producers.push(this.managerRef)
        this.cleanWorkers(this.producers)
        this.producers = []
    }
}