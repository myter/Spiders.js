import {SpiderBenchmark, BenchConfig} from "../../../benchUtils";
/**
 * Created by flo on 25/01/2017.
 */
export class NatCigaretteSmokersBench extends SpiderBenchmark{
    arbiterRef
    smokers

    constructor(){
        super("Native Cigarette Smokers","Native Cigarette Smokers cycle completed","Native Cigarette Smokers completed","Native Cigarette Smokers scheduled")
        this.smokers = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(event){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.cigSmokeSmokers +  1){
                    that.arbiterRef.postMessage(["pickRandom"])
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

        that.arbiterRef = that.spawnWorker(require('./CigaretteSmokersArbiter.js'))
        that.arbiterRef.onmessage = sysHandle
        that.arbiterRef.postMessage(["config",BenchConfig.cigSmokeRounds,BenchConfig.cigSmokeSmokers])
        var smokCount 	= BenchConfig.cigSmokeSmokers - 1
        while(smokCount >= 0){
            var newSmok = that.spawnWorker(require('./CigaretteSmokersSmoker.js'))
            newSmok.onmessage = sysHandle
            var chan = new MessageChannel()
            newSmok.postMessage(["config"],[chan.port1])
            that.arbiterRef.postMessage(["newSmoker"],[chan.port2])
            that.smokers.push(newSmok)
            smokCount -= 1
        }
    }

    cleanUp(){
        this.smokers.push(this.arbiterRef)
        this.cleanWorkers(this.smokers)
        this.smokers = []
    }
}