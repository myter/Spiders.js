import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class RateComputer extends spiders.Actor{
    rate = 0

    config(rate) {
        this.rate = rate
        this.parent.actorInit()
    }

    compute(term) {
        return this.rate * term * (1 - term);
    }
}

class SeriesWorker extends spiders.Actor{
    masterRef           = null
    rateComputerRef     = null
    startTerm           = 0
    curTerm             = 0

    config(masterRef,rateComputerRef,startTerm) {
        this.masterRef = masterRef
        this.rateComputerRef = rateComputerRef
        this.startTerm = startTerm
        this.curTerm = this.startTerm
        this.parent.actorInit()
    }

    nextTerm() {
        this.rateComputerRef.compute(this.curTerm).then((res)=> {
            this.curTerm = res
            this.masterRef.result(res)
        })
    }
}

class Master extends spiders.Actor{
    totalTerms      = 0
    workRequested   = 0
    workReceived    = 0
    workers         = []
    termsSum        = 0

    newWorker(workerRef,totalWorkers,totalTerms) {
        this.totalTerms = totalTerms
        this.workers.push(workerRef)
        if (this.workers.length == totalWorkers) {
            this.parent.actorInit()
        }
    }

    start() {
        var i = 0
        while (i < this.totalTerms) {
            this.workers.forEach((worker) => {
                worker.nextTerm()
                this.workRequested += 1
            })
            i++
        }
    }

    result(term) {
        this.termsSum += term
        this.workReceived += 1
        if (this.workRequested == this.workReceived) {
            this.parent.end()
        }
    }
}

class LogisticMapSeriesApp extends spiders.Application{
    actorsInitialised   = 0
    computers           = []
    workers             = []
    masterRef
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        this.masterRef 	= this.spawnActor(Master)
        var compCount 	= BenchConfig.logMapSeries - 1
        while(compCount >= 0){
            var newComp = this.spawnActor(RateComputer)
            this.computers.push(newComp)
            var rate = BenchConfig.logMapStartRate + (compCount * BenchConfig.logMapIncrement)
            newComp.config(rate)
            compCount -= 1
        }
        var workCount 	= BenchConfig.logMapSeries - 1
        while(workCount >= 0){
            var newWork 		= this.spawnActor(SeriesWorker)
            this.masterRef.newWorker(newWork,BenchConfig.logMapSeries,BenchConfig.logMapTerms)
            var rateComputerRef = this.computers[workCount % this.computers.length]
            var startTerm 		= workCount * BenchConfig.logMapIncrement
            newWork.config(this.masterRef,rateComputerRef,startTerm)
            this.workers.push(newWork)
            workCount 			-= 1
        }
    }

    checkConfig() {
        var that = this
        if (this.actorsInitialised == (BenchConfig.logMapSeries * 2) + 1) {
            this.masterRef.start()
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

export class SpiderLogisticMapSeriesBench extends SpiderBenchmark{
    logisticMapSeriesApp
    constructor(){
        super("Spiders.js Logistic Map Series","Spiders.js Logistic Map Series cycle completed","Spiders.js Logistic Map Series completed","Spiders.js Logistic Map Series scheduled")
    }

    runBenchmark(){
        this.logisticMapSeriesApp = new LogisticMapSeriesApp(this)
        this.logisticMapSeriesApp.setup()
    }

    cleanUp(){
        this.logisticMapSeriesApp.kill()
        this.logisticMapSeriesApp.workers = []
        this.logisticMapSeriesApp.computers = []
    }
}