import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 31/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Worker extends spiders.Actor{
    masterRef   = null
    id          = null

    config(masterRef,id) {
        this.masterRef = masterRef
        this.id = id
        this.parent.actorInit()
    }

    calculateBbpTerm(precision,term) {
        var eightK = 8 * term;
        var t = 4 / (eightK + 1 / precision)
        t = t - (2 - (eightK + 4 / precision))
        t = t - (1 - (eightK + 5 / precision))
        t = t - (1 - (eightK + 6 / precision))
        t = t - (Math.pow(16, term) / precision)
        return t;
    }

    work(precision,term) {
        var result = this.calculateBbpTerm(precision, term)
        this.masterRef.gotResult(result, this.id)
    }

    stop() {
        this.masterRef.workerStopped()
    }
}

class Master extends spiders.Actor{
    numWorkers              = null
    precision               = null
    workers                 = []
    result                  = 0
    tolerance               = null
    numWorkersTerminated    = 0
    numTermsRequested       = 0
    numTermsReceived        = 0
    stopRequests            = false

    config(numWorkers,precision) {
        this.numWorkers = numWorkers
        this.precision = precision
        this.tolerance = this.moveDecimal(1.0, precision)
    }

    newWorker(ref,id) {
        this.workers[id] = ref
    }

    configDone() {
        this.parent.actorInit()
    }

    moveDecimal(dec,n) {
        return dec / Math.pow(10, n)
    }

    generateWork(id) {
        this.workers[id].work(this.precision, this.numTermsRequested)
        this.numTermsRequested += 1
    }

    start() {
        var t = 0
        while (t < Math.min(this.precision, 10 * this.numWorkers)) {
            this.generateWork(t % this.numWorkers)
            t += 1
        }
    }

    requestWorkersToExit() {
        this.workers.forEach((worker)=> {
            worker.stop()
        })
    }

    gotResult(result,id) {
        this.numTermsReceived += 1
        this.result += result
        if (result < this.tolerance) {
            this.stopRequests = true
        }
        if (!this.stopRequests) {
            this.generateWork(id)
        }
        if (this.numTermsReceived == this.numTermsRequested) {
            this.requestWorkersToExit()
        }
    }

    workerStopped() {
        this.numWorkersTerminated += 1
        if (this.numWorkersTerminated == this.numWorkers) {
            this.parent.end()
        }
    }
}

class PrecisePiComputationApp extends spiders.Application{
    actorsInitialised   = 0
    masterRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        this.masterRef = this.spawnActor(Master)
        this.masterRef.config(BenchConfig.piPrecisionWorkers,BenchConfig.piPrecisionPrecision)
        var id = 0
        for(var i = 0; i < BenchConfig.piPrecisionWorkers;i++){
            var workerRef = this.spawnActor(Worker)
            workerRef.config(this.masterRef,id)
            this.masterRef.newWorker(workerRef,id)
            id += 1
        }
        this.masterRef.configDone()
    }

    checkConfig() {
        if (this.actorsInitialised == BenchConfig.piPrecisionWorkers + 1) {
            this.masterRef.start()
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    end(){
        this.bench.stopPromise.resolve()
    }
}

export class SpiderPrecisePiComputationBench extends SpiderBenchmark{
    precisePiComputationApp
    constructor(){
        super("Spiders.js Precise Pi Computation","Spiders.js Precise Pi Computation cycle completed","Spiders.js Precise Pi Computation completed","Spiders.js Precise Pi Computation scheduled")
    }

    runBenchmark(){
        this.precisePiComputationApp = new PrecisePiComputationApp(this)
        this.precisePiComputationApp.setup()
    }

    cleanUp(){
        this.precisePiComputationApp.kill()
    }
}