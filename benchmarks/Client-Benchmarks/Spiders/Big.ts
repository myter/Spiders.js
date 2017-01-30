import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Sink extends spiders.Actor{
    totalNeighbours = 0
    neighbours      = []
    exited          = 0

    neighbour(ref,totalAmount) {
        this.totalNeighbours = totalAmount
        this.neighbours.push(ref)
        if (this.neighbours.length == totalAmount) {
            this.parent.actorInit()
        }
    }

    exit() {
        this.exited += 1
        if (this.exited == this.totalNeighbours) {
            this.parent.end()
        }
    }
}

class BigActor extends spiders.Actor{
    sinkRef         = null
    neighbours      = []
    pingsReceived   = 0
    pingsExpected   = 0

    neighbour(ref,sinkRef,totalAmount,totalPings) {
        this.sinkRef = sinkRef
        this.pingsExpected = totalPings
        this.neighbours.push(ref)
        if (this.neighbours.length == totalAmount - 1) {
            this.parent.actorInit()
        }
    }

    ping(sender) {
        sender.pong()
    }

    pong() {
        if (this.pingsReceived == this.pingsExpected) {
            this.sinkRef.exit()
        }
        else {
            this.pingsReceived += 1
            var targetIndex = Math.floor((Math.random() * this.neighbours.length));
            var target = this.neighbours[targetIndex]
            target.ping(this)
        }
    }
}

class BigApp extends spiders.Application{
    actorsInitialised   = 0
    actors              = []
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        var sinkRef = this.spawnActor(Sink)
        this.actors = []
        var count = BenchConfig.bigActors
        while(count > 0){
            var newActor = this.spawnActor(BigActor)
            this.actors.push(newActor)
            count -= 1
        }
        for(var i in this.actors){
            var current = this.actors[i]
            sinkRef.neighbour(current,BenchConfig.bigActors)
            for(var j in this.actors){
                var next = this.actors[j]
                if(i != j){
                    current.neighbour(next,sinkRef,BenchConfig.bigActors,BenchConfig.bigPings)
                }
            }
        }
    }

    checkConfig() {
        //+1 for sink actor
        if (this.actorsInitialised == BenchConfig.bigActors + 1) {
            for (var i in this.actors) {
                this.actors[i].pong()
            }
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    end() {
        this.bench.stopPromise.resolve()
    }
}

export class SpiderBigBench extends SpiderBenchmark{
    bigApp
    constructor(){
        super("Spiders.js Big","Spiders.js Big cycle completed","Spiders.js Big completed","Spiders.js Big scheduled")
    }

    runBenchmark(){
        this.bigApp = new BigApp(this)
        this.bigApp.setup()
    }

    cleanUp(){
        this.bigApp.kill()
        this.bigApp.actors = []
    }
}