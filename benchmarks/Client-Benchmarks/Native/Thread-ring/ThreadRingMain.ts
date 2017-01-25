import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 25/01/2017.
 */
export class NatThreadRing extends SpiderBenchmark{
    actors
    constructor(){
        super("Native Thread Ring","Native Thread Ring cycle completed","Native Thread Ring completed","Native Thread Ring scheduled")
        this.actors = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandler(event){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.threadRingActors){
                    that.actors[0].postMessage(["ping",BenchConfig.threadRingPings])
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function traversalDone(){
                that.stopPromise.resolve()
            }

            switch(event.data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "traversalDone":
                    traversalDone()
                    break;
            }
        }

        var count = BenchConfig.threadRingActors
        while(count > 0){
            var newActor = this.spawnWorker(require('./ThreadRingActor.js'))
            newActor.onmessage = sysHandler
            this.actors.push(newActor)
            count -= 1
        }
        var index = 0
        for(var i in this.actors){
            var next = this.actors[i]
            var neighbour = (index + 1) % BenchConfig.threadRingActors
            var chan = new MessageChannel()
            next.postMessage(["neighbour",BenchConfig.threadRingActors],[chan.port1])
            this.actors[neighbour].postMessage(["newLink"],[chan.port2])
            index += 1
        }
    }
    cleanUp(){
        this.cleanWorkers(this.actors)
        this.actors = []
    }
}