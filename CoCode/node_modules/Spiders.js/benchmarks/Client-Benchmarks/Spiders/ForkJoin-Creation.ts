import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class ForkJoinActor extends spiders.Actor{
    init() {
        this.parent.actorInit()
    }

    calc(theta) {
        var sint = Math.sin(theta)
        return sint * sint
    }

    newMessage() {
        this.calc(37.2)
        this.parent.actorDone()
    }
}

class ForkJoinApp extends spiders.Application{
    actorsInitialised   = 0
    actorsDone          = 0
    actors              = []
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        var count = BenchConfig.fjCreationActors
        while(count > 0){
            var newActor = this.spawnActor(ForkJoinActor)
            this.actors.push(newActor)
            count -= 1
        }
    }

    checkConfig() {
        var that = this
        if (this.actorsInitialised == BenchConfig.fjCreationActors) {
            that.actorsDone = 0
            for (var i in this.actors) {
                this.actors[i].newMessage()
            }
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    actorDone() {
        this.actorsDone += 1
        if (this.actorsDone == BenchConfig.fjCreationActors) {
            this.bench.stopPromise.resolve()
        }
    }
}

export class SpiderForkJoinCreationBench extends SpiderBenchmark{
    forkJoinApp
    constructor(){
        super("Spiders.js Fork Join Creation","Spiders.js Fork Join Creation cycle completed","Spiders.js Fork Join Creation completed","Spiders.js Fork Join Creation scheduled")
    }

    runBenchmark(){
        this.forkJoinApp = new ForkJoinApp(this)
        this.forkJoinApp.setup()
    }

    cleanUp(){
        this.forkJoinApp.kill()
        this.forkJoinApp.actors = []
    }
}