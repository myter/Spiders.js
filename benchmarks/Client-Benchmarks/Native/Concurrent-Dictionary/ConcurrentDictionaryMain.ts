import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 25/01/2017.
 */
export class NatConcurrentDictionaryBench extends SpiderBenchmark{
    actors
    masterRef
    dictRef

    constructor(){
        super("Native Concurrent Dictionary","Native Concurrent Dictionary cycle completed","Native Concurrent Dictionary completed","Native Concurrent Dictionary scheduled")
        this.actors = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandler(event){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.cDictActors + 2){
                    for(var i in that.actors){
                        that.actors[i].postMessage(["work"])
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
            }
        }

        that.masterRef = that.spawnWorker(require('./ConcurrentDictionaryMaster.js'))
        that.masterRef.onmessage = sysHandler
        that.masterRef.postMessage(["config",BenchConfig.cDictActors])
        that.dictRef = that.spawnWorker(require('./ConcurrentDictionaryDictionary.js'))
        that.dictRef.onmessage = sysHandler
        var count = BenchConfig.cDictActors
        while(count > 0){
            var newActor = that.spawnWorker(require('./ConcurrentDictionaryWorker.js'))
            newActor.onmessage = sysHandler
            that.actors.push(newActor)
            var masChan = new MessageChannel()
            var dictChan = new MessageChannel()
            that.masterRef.postMessage(["link"],[masChan.port2])
            that.dictRef.postMessage(["link"],[dictChan.port2])
            newActor.postMessage(["linkMaster"],[masChan.port1])
            newActor.postMessage(["linkDict"],[dictChan.port1])
            newActor.postMessage(["config",BenchConfig.cDictWrite,BenchConfig.cDictMsgs])
            count -= 1
        }
    }

    cleanUp(){
        this.actors.push(this.masterRef)
        this.actors.push(this.dictRef)
        this.cleanWorkers(this.actors)
        this.actors = []
    }
}