const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class RateComputer extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.rate = 0;
    }
    config(rate) {
        this.rate = rate;
        this.parent.actorInit();
    }
    compute(term) {
        return this.rate * term * (1 - term);
    }
}
class SeriesWorker extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.masterRef = null;
        this.rateComputerRef = null;
        this.startTerm = 0;
        this.curTerm = 0;
    }
    config(masterRef, rateComputerRef, startTerm) {
        this.masterRef = masterRef;
        this.rateComputerRef = rateComputerRef;
        this.startTerm = startTerm;
        this.curTerm = this.startTerm;
        this.parent.actorInit();
    }
    nextTerm() {
        this.rateComputerRef.compute(this.curTerm).then((res) => {
            this.curTerm = res;
            this.masterRef.result(res);
        });
    }
}
class Master extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.totalTerms = 0;
        this.workRequested = 0;
        this.workReceived = 0;
        this.workers = [];
        this.termsSum = 0;
    }
    newWorker(workerRef, totalWorkers, totalTerms) {
        this.totalTerms = totalTerms;
        this.workers.push(workerRef);
        if (this.workers.length == totalWorkers) {
            this.parent.actorInit();
        }
    }
    start() {
        var i = 0;
        while (i < this.totalTerms) {
            this.workers.forEach((worker) => {
                worker.nextTerm();
                this.workRequested += 1;
            });
            i++;
        }
    }
    result(term) {
        this.termsSum += term;
        this.workReceived += 1;
        if (this.workRequested == this.workReceived) {
            this.parent.end();
        }
    }
}
class LogisticMapSeriesApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.computers = [];
        this.workers = [];
        this.bench = bench;
    }
    setup() {
        this.masterRef = this.spawnActor(Master);
        var compCount = benchUtils_1.BenchConfig.logMapSeries - 1;
        while (compCount >= 0) {
            var newComp = this.spawnActor(RateComputer);
            this.computers.push(newComp);
            var rate = benchUtils_1.BenchConfig.logMapStartRate + (compCount * benchUtils_1.BenchConfig.logMapIncrement);
            newComp.config(rate);
            compCount -= 1;
        }
        var workCount = benchUtils_1.BenchConfig.logMapSeries - 1;
        while (workCount >= 0) {
            var newWork = this.spawnActor(SeriesWorker);
            this.masterRef.newWorker(newWork, benchUtils_1.BenchConfig.logMapSeries, benchUtils_1.BenchConfig.logMapTerms);
            var rateComputerRef = this.computers[workCount % this.computers.length];
            var startTerm = workCount * benchUtils_1.BenchConfig.logMapIncrement;
            newWork.config(this.masterRef, rateComputerRef, startTerm);
            this.workers.push(newWork);
            workCount -= 1;
        }
    }
    checkConfig() {
        var that = this;
        if (this.actorsInitialised == (benchUtils_1.BenchConfig.logMapSeries * 2) + 1) {
            this.masterRef.start();
        }
    }
    actorInit() {
        this.actorsInitialised += 1;
        this.checkConfig();
    }
    end() {
        this.bench.stopPromise.resolve();
    }
}
class SpiderLogisticMapSeriesBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Logistic Map Series", "Spiders.js Logistic Map Series cycle completed", "Spiders.js Logistic Map Series completed", "Spiders.js Logistic Map Series scheduled");
    }
    runBenchmark() {
        this.logisticMapSeriesApp = new LogisticMapSeriesApp(this);
        this.logisticMapSeriesApp.setup();
    }
    cleanUp() {
        this.logisticMapSeriesApp.kill();
        this.logisticMapSeriesApp.workers = [];
        this.logisticMapSeriesApp.computers = [];
    }
}
exports.SpiderLogisticMapSeriesBench = SpiderLogisticMapSeriesBench;
//# sourceMappingURL=LogisticMapSeries.js.map