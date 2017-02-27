import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class PrimeFilter extends spiders.Actor{
    local       = null
    id          = null
    initPrime   = null
    nextFilter  = null
    localPrimes = []
    available   = 1

    config(id,initPrime,local) {
        this.local = local
        this.id = id
        this.initPrime = initPrime
        this.parent.actorInit()
        this.localPrimes[0] = initPrime
    }

    isLocallyPrime(candidate,startInc,endExc) {
        for (var i = startInc; i < endExc; i++) {
            var remainder = candidate % this.localPrimes[i];
            if (remainder == 0) {
                return false;
            }
        }
        return true;
    }

    handleNewPrime(candidate) {
        if (this.available < this.local) {
            this.localPrimes[this.available] = candidate
            this.available += 1
        }
        else {
            this.parent.spawnNew(this.id + 1, candidate).then((ref)=> {
                this.nextFilter = ref
            })
        }
    }

    longBox(candidate) {
        var localPrime = this.isLocallyPrime(candidate, 0, this.available)
        if (localPrime) {
            if (this.nextFilter == null) {
                this.handleNewPrime(candidate)
            }
            else {
                this.nextFilter.longBox(candidate)
            }
        }
    }

    stop() {
        if (this.nextFilter == null) {
            this.parent.end()
        }
        else {
            this.nextFilter.stop()
        }
    }
}

class NumberProducer extends spiders.Actor{
    limit       = null
    filterRef   = null

    config(limit,filterRef) {
        this.limit = limit
        this.filterRef = filterRef
        this.parent.actorInit()
    }

    start() {
        var candidate = 3
        while (candidate < this.limit) {
            this.filterRef.longBox(candidate)
            candidate += 2
        }
        this.filterRef.stop()
    }
}

class SieveOfEratosthenesApp extends spiders.Application{
    actorsInitialised   = 0
    producerRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        var filterRef 	= this.spawnActor(PrimeFilter)
        filterRef.config(1,2,BenchConfig.sieveLocal)
        this.producerRef = this.spawnActor(NumberProducer)
        this.producerRef.config(BenchConfig.sieveLimit,filterRef)
    }

    checkConfig() {
        if (this.actorsInitialised == 2) {
            this.producerRef.start()
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    end() {
        this.bench.stopPromise.resolve()
    }

    spawnNew(id,initPrime) {
        var ref = this.spawnActor(PrimeFilter)
        ref.config(id, initPrime, BenchConfig.sieveLocal)
        return ref
    }
}

export class SpiderSieveOfEratosthenesBench extends SpiderBenchmark{
    sieveOfEratosthenesApp
    constructor(){
        super("Spiders.js Sieve Of Eratosthenes","Spiders.js Sieve Of Eratosthenes cycle completed","Spiders.js Sieve Of Eratosthenes completed","Spiders.js Sieve Of Eratosthenes scheduled")
    }

    runBenchmark(){
        this.sieveOfEratosthenesApp = new SieveOfEratosthenesApp(this)
        this.sieveOfEratosthenesApp.setup()
    }

    cleanUp(){
        this.sieveOfEratosthenesApp.kill()
    }
}