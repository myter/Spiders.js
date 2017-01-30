import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
import {SpiderLib} from "../../../src/spiders";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require('../../../src/spiders')

class Producer extends spiders.Actor{
    totalCount  = null
    countsLeft  = null
    countRef    = null

    config(countNumber,countRef) {
        this.totalCount = countNumber
        this.countsLeft = countNumber
        this.countRef   = countRef
        this.parent.prodInit()
    }

    start() {
        this.countsLeft = this.totalCount
        this.countRef.inc(true)
        while (this.countsLeft > 0) {
            this.countRef.inc(false)
            this.countsLeft -= 1
        }
    }
}

class Counter extends spiders.Actor{
    totalCount = null
    countSoFar = null

    config(countNumber) {
        this.totalCount = countNumber
        this.countSoFar = 0
        this.parent.countInit()
    }

    inc(fresh) {
        if (fresh) {
            this.countSoFar = 0
        }
        else {
            this.countSoFar += 1
            if (this.countSoFar == this.totalCount) {
                this.parent.countsExhausted()
            }
        }
    }
}

class CountingApp extends spiders.Application{
    prodInitialised     = false
    countInitialised    = false
    prodRef
    bench : SpiderBenchmark

    constructor(bench){
        super()
        this.bench = bench
    }

    setup(){
        var countRef = this.spawnActor(Counter)
        countRef.config(BenchConfig.count)
        this.prodRef = this.spawnActor(Producer)
        this.prodRef.config(BenchConfig.count,countRef)
    }

    checkConfig() {
        if (this.prodInitialised && this.countInitialised) {
            this.prodRef.start()
        }
    }

    prodInit() {
        this.prodInitialised = true
        this.checkConfig()
    }

    countInit() {
        this.countInitialised = true
        this.checkConfig()
    }

    countsExhausted() {
        this.bench.stopPromise.resolve()
    }
}
export class SpiderCountingActorBench extends SpiderBenchmark{
    countApp
    constructor(){
        super("Spiders.js Counting Actor","Spiders.js Counting Actor cycle completed","Spiders.js Counting Actor completed","Spiders.js Counting Actor scheduled")
    }

    runBenchmark(){
        this.countApp = new CountingApp(this)
        this.countApp.setup()
    }

    cleanUp(){
        this.countApp.kill()
    }
}