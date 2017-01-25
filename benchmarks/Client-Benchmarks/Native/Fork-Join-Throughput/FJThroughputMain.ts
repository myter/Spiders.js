import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 25/01/2017.
 */
export class NatFJThroughputBench extends SpiderBenchmark{
    actors
    constructor(){
        super("Native Fork-join throughput","Native Fork-join cycle completed","Native Fork-join completed","Native Fork-join scheduled")
        this.actors = []
    }
    runBenchmark(){
        var actorsInitialised   = 0
        var actorsDone          = 0
        var that = this
        function sysHandler(event){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.fjThroughputActors){
                    actorsDone 	= 0
                    for(var i in that.actors){
                        that.actors[i].postMessage(["newMessage",true])
                    }
                    for(var i in that.actors){
                        var next = that.actors[i]
                        for(var j = 0;j < BenchConfig.fjThroughputMessages;j++){
                            next.postMessage(["newMessage",false])
                        }
                    }
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function actorDone(){
                actorsDone += 1
                if(actorsDone == BenchConfig.fjThroughputActors){
                    that.stopPromise.resolve()
                }
            }

            switch(event.data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "actorDone":
                    actorDone()
                    break;
            }
        }
        var count = BenchConfig.fjThroughputActors
        while(count > 0){
            var newActor = this.spawnWorker(require('./FJThroughputActor.js'))
            newActor.onmessage = sysHandler
            that.actors.push(newActor)
            newActor.postMessage(["config",BenchConfig.fjThroughputMessages])
            count -= 1
        }
    }
    cleanUp(){
        this.cleanWorkers(this.actors)
        this.actors = []
    }
}