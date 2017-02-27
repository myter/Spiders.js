import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 31/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class Worker extends spiders.Actor{
    masterRef   = null
    id          = null
    Decimal
    config(masterRef,id) {
        this.masterRef = masterRef
        this.id = id
        this.parent.actorInit()
        var isNode = false;
        if (typeof process === 'object') {
            if (typeof process.versions === 'object') {
                if (typeof process.versions.node !== 'undefined') {
                    isNode = true;
                }
            }
        }
        if(isNode){
            this.Decimal = require('decimal.js')
        }
        else{
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/decimal.js/7.1.1/decimal.min.js')
            this.Decimal = (self as any).Decimal
        }
    }

    calcTerm(term) {
        // the Bailey-Borwein-Plouffe formula
        // http://stackoverflow.com/questions/4484489/using-basic-arithmetics-for-calculating-pi-with-arbitary-precision
        var p16 = new this.Decimal(1);
        var term = new this.Decimal(0);
        var one = new this.Decimal(1);
        var two = new this.Decimal(2);
        var four = new this.Decimal(4);
        var k8 = new this.Decimal(term);
        var f = four.div(k8.plus(1))
            .minus(two.div(k8.plus(4)))
            .minus(one.div(k8.plus(5)))
            .minus(one.div(k8.plus(6)));

        term = term.plus(p16.times(f));
        p16 = p16.div(16);
        k8 = k8.plus(8);

        /*for (var k = new this.Decimal(0); k.lte(precision); k = k.plus(one)) {
            // pi += 1/p16 * (4/(8*k + 1) - 2/(8*k + 4) - 1/(8*k + 5) - 1/(8*k+6));
            // p16 *= 16;
            //
            // a little simpler:
            // pi += p16 * (4/(8*k + 1) - 2/(8*k + 4) - 1/(8*k + 5) - 1/(8*k+6));
            // p16 /= 16;

            var f = four.div(k8.plus(1))
                .minus(two.div(k8.plus(4)))
                .minus(one.div(k8.plus(5)))
                .minus(one.div(k8.plus(6)));

            pi = pi.plus(p16.times(f));
            p16 = p16.div(16);
            k8 = k8.plus(8);
        }*/

        return term;
    }

    calculateBbpTerm(precision,term){
        //At this point getting the actual term does not matter
        //Naive implementation of benchmark which simply calculated pi for the given precies for each term
        var term = this.calcTerm(term)
        console.log("Calculating")
        return this.calcTerm(term)
    }

    work(precision,term) {
        var result = this.calculateBbpTerm(precision, term)
        this.masterRef.gotResult(0, this.id)
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
    currentTerm             = 0
    numWorkersTerminated    = 0
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
        this.workers[id].work(this.precision, this.currentTerm)
        this.currentTerm += 1
    }

    start() {
        /*this.workers.forEach((_,id)=>{
            this.generateWork(id)
        })*/
        var t = 0
        while (t < this.precision) {
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
        if (this.numTermsReceived == this.precision) {
            this.requestWorkersToExit()
        }
        /*else{
            //This worker is now idle, send back work
            this.generateWork(id)
        }*/
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