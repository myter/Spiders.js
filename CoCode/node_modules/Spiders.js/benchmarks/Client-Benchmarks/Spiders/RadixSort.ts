import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Validation extends spiders.Actor{
    dataSize    = 0
    sumSoFar    = 0
    valueSoFar  = 0
    prevValue   = 0
    errorValue1 = -1
    errorValue2 = -1

    config(dataSize) {
        this.dataSize = dataSize
        this.parent.actorInit()
    }

    value(candidate) {
        this.valueSoFar += 1
        if (candidate < this.prevValue && this.errorValue1 < 0) {
            this.errorValue2 = candidate
            this.errorValue1 = this.valueSoFar - 1
        }
        this.prevValue = candidate
        this.sumSoFar += this.prevValue
        if (this.valueSoFar == this.dataSize) {
            this.parent.actorExit()
        }
    }
}

class Sort extends spiders.Actor{
    dataSize    = 0
    radix       = 0
    nextRef     = null
    valueSoFar  = 0
    j           = 0
    ordering    = []

    config(dataSize,radix,nextRef) {
        this.dataSize = dataSize
        this.radix = radix
        this.nextRef = nextRef
        this.parent.actorInit()
    }

    value(candidate) {
        this.valueSoFar += 1
        var current = candidate
        if ((current & this.radix) == 0) {
            this.nextRef.value(candidate)
        }
        else {
            this.ordering[this.j] = candidate
            this.j += 1
        }
        if (this.valueSoFar == this.dataSize) {
            var i = 0
            while (i < this.j) {
                this.nextRef.value(this.ordering[i])
                i++
            }
            this.parent.actorExit()
        }

    }
}

class Source extends spiders.Actor{
    dataSize = 	0
    maxValue = 	0

    config(dataSize,maxValue) {
        this.dataSize = dataSize
        this.maxValue = maxValue
        this.parent.actorInit()
    }

    getRandom(upper) {
        return Math.floor(Math.random() * (upper - 0) + 0)
    }

    nextActor(nextRef) {
        var i = 0
        while (i < this.dataSize) {
            var candidate = this.getRandom(100000) % this.maxValue
            nextRef.value(candidate)
            i++
        }
        this.parent.actorExit()
    }
}

class RadixSortApp extends spiders.Application{
    actorsInitialised   = 0
    actorsExited        = 0
    totalActors
    nextActor
    sourceRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        this.sourceRef 	= this.spawnActor(Source)
        this.sourceRef.config(BenchConfig.radixSortDataSize,BenchConfig.radixSortMaxVal)
        var validRef 	= this.spawnActor(Validation)
        validRef.config(BenchConfig.radixSortDataSize)
        this.totalActors = 2
        var radix 		= Math.floor(BenchConfig.radixSortMaxVal /  2)
        this.nextActor 	= validRef
        while(Math.floor(radix) > 0){
            var localRadix 		= radix
            var localNextActor	= this.nextActor
            var sortRef 		= this.spawnActor(Sort)
            sortRef.config(BenchConfig.radixSortDataSize,localRadix,localNextActor)
            radix 				= radix / 2
            this.totalActors			+= 1
            this.nextActor 			= sortRef
        }
    }

    checkConfig() {
        if (this.actorsInitialised == this.totalActors) {
            this.sourceRef.nextActor(this.nextActor)
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    actorExit() {
        this.actorsExited += 1
        if (this.actorsExited == this.totalActors) {
            this.bench.stopPromise.resolve()
        }
    }

    end(){
    this.bench.stopPromise.resolve()
    }
}

export class SpiderRadixSortBench extends SpiderBenchmark{
    radixSortApp
    constructor(){
        super("Spiders.js Radix Sort","Spiders.js Radix Sort cycle completed","Spiders.js Radix Sort completed","Spiders.js Radix Sort scheduled")
    }

    runBenchmark(){
        this.radixSortApp = new RadixSortApp(this)
        this.radixSortApp.setup()
    }

    cleanUp(){
        this.radixSortApp.kill()
    }
}
