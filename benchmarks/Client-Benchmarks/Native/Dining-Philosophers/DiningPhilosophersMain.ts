import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 25/01/2017.
 */
export class NatDiningPhilosopherBench extends SpiderBenchmark{
    waiterRef
    philosophers

    constructor(){
        super("Native Dining Philosophers","Native Dining Philosophers cycle completed","Native Dining Philosophers completed","Native Dining Philosophers scheduled")
        this.philosophers = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(event){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.philosopherActors + 1){
                    for(var i in that.philosophers){
                        that.philosophers[i].postMessage(["start"])
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

        that.waiterRef = that.spawnWorker(require('./DiningPhilosopherWaiter.js'))
        that.waiterRef.onmessage = sysHandle
        that.waiterRef.postMessage(["config",BenchConfig.philosopherActors])
        var philCount = BenchConfig.philosopherActors - 1
        while(philCount >= 0){
            var newPhil = that.spawnWorker(require('./DiningPhilosophersPhilosopher.js'))
            newPhil.onmessage = sysHandle
            var chan = new MessageChannel()
            that.waiterRef.postMessage(["link"],[chan.port2])
            newPhil.postMessage(["config",philCount,BenchConfig.philosopherEating],[chan.port1])
            that.philosophers.push(newPhil)
            philCount -= 1
        }
    }

    cleanUp(){
        this.philosophers.push(this.waiterRef)
        this.cleanWorkers(this.philosophers)
        this.philosophers = []
    }
}