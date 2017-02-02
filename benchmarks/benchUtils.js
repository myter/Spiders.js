/**
 * Created by flo on 24/01/2017.
 */
class BenchConfig {
}
//Ping pong 
BenchConfig.pingAmount = 10000;
//Count 
BenchConfig.count = 100000;
//Fork join throughput 
BenchConfig.fjThroughputActors = 20;
BenchConfig.fjThroughputMessages = 1000;
//Fork join creation 
BenchConfig.fjCreationActors = 10;
//Thread ring 
BenchConfig.threadRingActors = 20;
BenchConfig.threadRingPings = 1000;
//Chameneo 
BenchConfig.chameneoMeetings = 500;
BenchConfig.chameneoActors = 10;
//Big config
BenchConfig.bigActors = 10;
BenchConfig.bigPings = 3000;
//Concurrent Dictionary 
BenchConfig.cDictActors = 20;
BenchConfig.cDictMsgs = 500;
BenchConfig.cDictWrite = 300;
//Concurrent sorted linked list
BenchConfig.cLinkedListActors = 10;
BenchConfig.cLinkedListMsgs = 100;
BenchConfig.cLinkedListWrites = 10;
BenchConfig.cLinkedListSize = 10;
//Producer Consumer
BenchConfig.prodConBuffer = 50;
BenchConfig.prodConProd = 5;
BenchConfig.prodConCon = 5;
BenchConfig.prodConItems = 100;
BenchConfig.prodConProdCost = 25;
BenchConfig.prodConConCost = 25;
//Philosopher
BenchConfig.philosopherActors = 10;
BenchConfig.philosopherEating = 100;
//Barber
BenchConfig.barberNrHaircuts = 20;
BenchConfig.barberWaitingRoom = 100;
BenchConfig.barberProduction = 500;
BenchConfig.barberHaircut = 500;
//Cigarette Smokers
BenchConfig.cigSmokeRounds = 500;
BenchConfig.cigSmokeSmokers = 20;
//Logistic map
BenchConfig.logMapTerms = 200;
BenchConfig.logMapSeries = 9;
BenchConfig.logMapStartRate = 3.46;
BenchConfig.logMapIncrement = 0.0025;
//Banking
BenchConfig.bankingAccounts = 20;
BenchConfig.bankingTransactions = 500;
BenchConfig.bankingInitialBalance = BenchConfig.bankingAccounts * BenchConfig.bankingTransactions;
//Radix sort
BenchConfig.radixSortDataSize = 500;
BenchConfig.radixSortMaxVal = 1000;
//Filter bank
BenchConfig.filterBankColumns = 8192 * 2;
BenchConfig.filterBankSimulations = 500;
BenchConfig.filterBankChannels = 2;
//Sieve
BenchConfig.sieveLimit = 100000;
BenchConfig.sieveLocal = 50000;
//UCT
BenchConfig.uctMaxNodes = 20;
BenchConfig.uctAvgCompSize = 1000;
BenchConfig.uctStdevCompSize = 500;
BenchConfig.uctBinomial = 5;
BenchConfig.uctPercent = 70;
//Fac loc
BenchConfig.facLocNumPoints = 1000;
BenchConfig.facLocGridSize = 500;
BenchConfig.facLocF = Math.sqrt(2) * 500;
BenchConfig.facLocAlpha = 2.0;
BenchConfig.facLocCuttOff = 3;
//Trapezoid
BenchConfig.trapezoidPieces = 1000000;
BenchConfig.trapezoidWorkers = 20;
BenchConfig.trapezoidLeft = 1;
BenchConfig.trapezoidRight = 5;
//Pi Precision
BenchConfig.piPrecisionWorkers = 20;
BenchConfig.piPrecisionPrecision = 5000;
//Matrix Multiplication
BenchConfig.matMulWorkers = 20;
BenchConfig.matMulDataLength = 1024;
BenchConfig.matMulThreshold = 16384;
//Quicksort
BenchConfig.quickDataSize = 5000;
BenchConfig.quickMaxVal = 1 << 60;
BenchConfig.quickThreshold = 1000;
//All pair shortes path
BenchConfig.apspN = 20;
BenchConfig.apspB = 5;
BenchConfig.apspW = 10;
//Successive over relaxation
BenchConfig.sorRefVal = [0.000003189420084871275, 0.001846644602759566, 0.0032099996270638005, 0.0050869220175413146, 0.008496328291240363, 0.016479973604143234, 0.026575660248076397, 1.026575660248076397, 2.026575660248076397, 3.026575660248076397];
BenchConfig.sorDataSizes = [2, 5, 20, 80, 100, 120, 150, 200, 250, 300, 350, 400];
BenchConfig.sorJacobi = 100;
BenchConfig.sorOmega = 1.25;
BenchConfig.sorN = 1;
//A star search 
BenchConfig.aStarWorkers = 30;
BenchConfig.aStarThreshold = 100;
BenchConfig.aStarGridSize = 5;
//N queens
BenchConfig.nQueensWorkers = 20;
BenchConfig.nQueensSize = 5;
BenchConfig.nQueensThreshold = 4;
BenchConfig.nQueensSolutions = 500;
BenchConfig.nQueensPriorities = 10;
exports.BenchConfig = BenchConfig;
var Benchmark = require('benchmark');
window.Benchmark = Benchmark;
class SpiderBenchmarkRunner {
    constructor() {
        this.scheduled = [];
    }
    schedule(benchmarkClass) {
        var that = this;
        var spiderBench = new benchmarkClass();
        var bench = new Benchmark(spiderBench.name, {
            defer: true,
            async: true,
            fn: function (deffered) {
                spiderBench.setBenchDone(deffered);
                spiderBench.runBenchmark();
            },
            teardown: function () {
                spiderBench.cleanUp();
            },
            onCycle: function () {
                console.log(spiderBench.cycleMessage);
            },
            onComplete: function () {
                //This will actually be bound to type
                console.log(spiderBench.completeMessage + this.stats.mean);
                console.log("Error margin: " + this.stats.moe);
                spiderBench.cleanUp();
                that.nextBenchmark();
            },
        });
        this.scheduled.push(bench);
        console.log(spiderBench.scheduleMessage);
    }
    nextBenchmark() {
        this.currentBench += 1;
        if (this.scheduled.length != 0) {
            this.scheduled.pop().run();
        }
    }
}
exports.SpiderBenchmarkRunner = SpiderBenchmarkRunner;
class SpiderBenchmark {
    constructor(name, cycleMessage, completeMessage, scheduleMessage) {
        this.name = name;
        this.cycleMessage = cycleMessage;
        this.completeMessage = completeMessage;
        this.scheduleMessage = scheduleMessage;
        this.spawnWorker = require('webworkify');
    }
    setBenchDone(benchDone) {
        this.stopPromise = benchDone;
    }
    cleanWorkers(workerRefs) {
        workerRefs.forEach((worker) => {
            worker.terminate();
        });
    }
}
exports.SpiderBenchmark = SpiderBenchmark;
//# sourceMappingURL=benchUtils.js.map