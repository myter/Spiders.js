import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Smoker extends spiders.Actor{
    arbiterRef

    config(arbiterRef){
        this.arbiterRef = arbiterRef
        this.parent.actorInit()
    }

    busyWait(limit) {
        for (var i = 0; i < limit; i++) {
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }

    startSmoking(time) {
        this.arbiterRef.startedSmoking()
        this.busyWait(time)
    }
}

class Arbiter extends spiders.Actor{
    totalRounds     = 0
    currentRounds   = 0
    totalSmokers    = 0
    smokers         = []

    config(totalRounds,totalSmokers) {
        this.totalRounds = totalRounds
        this.totalSmokers = totalSmokers
    }

    newSmoker(smokerRef) {
        this.smokers.push(smokerRef)
        if (this.smokers.length == this.totalSmokers) {
            this.parent.actorInit()
        }
    }

    getRandom(upper) {
        return Math.floor(Math.random() * (upper - 0) + 0)
    }

    pickRandom() {
        var index = this.getRandom(this.totalSmokers)
        var time = this.getRandom(1000)
        this.smokers[index].startSmoking(time)
    }

    startedSmoking() {
        this.currentRounds += 1
        if (this.currentRounds >= this.totalRounds) {
            this.parent.end()
        }
        else {
            this.pickRandom()
        }
    }
}

class CigaretteSmokersApp extends spiders.Application{
    actorsInitialised = 0
    arbiterRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        this.arbiterRef = this.spawnActor(Arbiter)
        this.arbiterRef.config(BenchConfig.cigSmokeRounds,BenchConfig.cigSmokeSmokers)
        var smokCount 	= BenchConfig.cigSmokeSmokers - 1
        while(smokCount >= 0){
            var newSmok = this.spawnActor(Smoker)
            newSmok.config(this.arbiterRef)
            this.arbiterRef.newSmoker(newSmok)
            smokCount -= 1
        }
    }

    checkConfig() {
        if (this.actorsInitialised == BenchConfig.cigSmokeSmokers + 1) {
            this.arbiterRef.pickRandom()
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

export class SpiderCigaretteSmokersBench extends SpiderBenchmark{
    cigaretteSmokersApp
    constructor(){
        super("Spiders. Cigarette Smokers","Spiders. Cigarette Smokers cycle completed","Spiders. Cigarette Smokers completed","Spiders. Cigarette Smokers scheduled")
    }

    runBenchmark(){
        this.cigaretteSmokersApp = new CigaretteSmokersApp(this)
        this.cigaretteSmokersApp.setup()
    }

    cleanUp(){
        this.cigaretteSmokersApp.kill()
    }
}