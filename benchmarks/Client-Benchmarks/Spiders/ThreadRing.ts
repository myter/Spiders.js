import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class PingMessage extends spiders.Isolate{
    pingsLeft
    constructor(pingsLeft){
        super()
        this.pingsLeft = pingsLeft
    }
}

class StopMessage extends spiders.Isolate{
    stopsLeft
    constructor(stopsLeft){
        super()
        this.stopsLeft = stopsLeft
    }
}

class ThreadRingActor extends spiders.Actor{
    allNeighbours   = null
    myNeighbour     = null
    StopMessage

    constructor(){
        super()
        this.StopMessage = StopMessage
    }

    ping(pingMessage) {
        if (pingMessage.pingsLeft > 0) {
            pingMessage.pingsLeft = pingMessage.pingsLeft - 1
            this.myNeighbour.ping(pingMessage)
        }
        else {
            this.myNeighbour.stop(new this.StopMessage(this.allNeighbours))
        }
    }

    stop(stopMessage) {
        if (stopMessage.stopsLeft > 0) {
            stopMessage.stopsLeft = stopMessage.stopsLeft - 1
            this.myNeighbour.stop(stopMessage)
        }
        else {
            this.parent.traversalDone()
        }
    }

    neighbour(ref,totalActors) {
        this.myNeighbour = ref
        this.allNeighbours = totalActors
        this.parent.actorInit()
    }
}

class ThreadRingApp extends spiders.Application{
    actorsInitialised   = 0
    actors              = []
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        var count = BenchConfig.threadRingActors
        while(count > 0){
            var newActor = this.spawnActor(ThreadRingActor)
            this.actors.push(newActor)
            count -= 1
        }
        var index = 0
        for(var i in this.actors){
            var next = this.actors[i]
            var neighbour = (index + 1) % BenchConfig.threadRingActors
            next.neighbour(this.actors[neighbour],BenchConfig.threadRingActors)
            index += 1
        }
    }

    checkConfig() {
        if (this.actorsInitialised == BenchConfig.threadRingActors) {
            this.actors[0].ping(new PingMessage(BenchConfig.threadRingPings))
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    traversalDone() {
        this.bench.stopPromise.resolve()
    }
}

export class SpiderThreadRingBench extends SpiderBenchmark{
    threadRingApp
    constructor(){
        super("Spiders.js Thread Ring","Spiders.js Thread Ring cycle completed","Spiders.js Thread Ring completed","Spiders.js Thread Ring scheduled")
    }

    runBenchmark(){
        this.threadRingApp = new ThreadRingApp(this)
        this.threadRingApp.setup()
    }

    cleanUp(){
        this.threadRingApp.kill()
        this.threadRingApp.actors = []
    }
}