/**
 * Created by flo on 24/01/2017.
 */
class BenchConfig {
}
//Ping pong 
BenchConfig.pingAmount = 10000;
//Count 
BenchConfig.count = 50000;
//Fork join throughput 
BenchConfig.fjThroughputActors = 10;
BenchConfig.fjThroughputMessages = 10000;
//Fork join creation 
BenchConfig.fjCreationActors = 30;
//Thread ring 
BenchConfig.threadRingActors = 10;
BenchConfig.threadRingPings = 10000;
//Chameneo 
BenchConfig.chameneoMeetings = 1000;
BenchConfig.chameneoActors = 20;
//Big config
BenchConfig.bigActors = 10;
BenchConfig.bigPings = 2000;
//Concurrent Dictionary 
BenchConfig.cDictActors = 10;
BenchConfig.cDictMsgs = 1000;
BenchConfig.cDictWrite = 500;
//Concurrent sorted linked list
BenchConfig.cLinkedListActors = 20;
BenchConfig.cLinkedListMsgs = 500;
BenchConfig.cLinkedListWrites = 50;
BenchConfig.cLinkedListSize = 50;
//Producer Consumer
BenchConfig.prodConBuffer = 50;
BenchConfig.prodConProd = 5;
BenchConfig.prodConCon = 5;
BenchConfig.prodConItems = 100;
BenchConfig.prodConProdCost = 25;
BenchConfig.prodConConCost = 25;
//Philosopher
BenchConfig.philosopherActors = 10;
BenchConfig.philosopherEating = 300;
//Barber
BenchConfig.barberNrHaircuts = 40;
BenchConfig.barberWaitingRoom = 2;
BenchConfig.barberProduction = 50000;
BenchConfig.barberHaircut = 50000;
//Cigarette Smokers
BenchConfig.cigSmokeRounds = 700;
BenchConfig.cigSmokeSmokers = 20;
//Logistic map
BenchConfig.logMapTerms = 200;
BenchConfig.logMapSeries = 9;
BenchConfig.logMapStartRate = 3.46;
BenchConfig.logMapIncrement = 0.0025;
//Banking
BenchConfig.bankingAccounts = 20;
BenchConfig.bankingTransactions = 5000;
BenchConfig.bankingInitialBalance = BenchConfig.bankingAccounts * BenchConfig.bankingTransactions;
//Radix sort
BenchConfig.radixSortDataSize = 1000;
BenchConfig.radixSortMaxVal = 5000;
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
BenchConfig.facLocAlpha = 4.0;
BenchConfig.facLocCuttOff = 5;
//Trapezoid
BenchConfig.trapezoidPieces = 1000000;
BenchConfig.trapezoidWorkers = 20;
BenchConfig.trapezoidLeft = 1;
BenchConfig.trapezoidRight = 5;
//Pi Precision
BenchConfig.piPrecisionWorkers = 20;
BenchConfig.piPrecisionPrecision = 100000;
//Matrix Multiplication
BenchConfig.matMulWorkers = 20;
BenchConfig.matMulDataLength = 512;
BenchConfig.matMulThreshold = 8192;
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
BenchConfig.aStarWorkers = 20;
BenchConfig.aStarThreshold = 100;
BenchConfig.aStarGridSize = 5;
//N queens
BenchConfig.nQueensWorkers = 20;
BenchConfig.nQueensSize = 12;
BenchConfig.nQueensThreshold = 8;
BenchConfig.nQueensSolutions = 1500000;
BenchConfig.nQueensPriorities = 10;
exports.BenchConfig = BenchConfig;
var Benchmark = require('benchmark');
var isNode = false;
if (typeof process === 'object') {
    if (typeof process.versions === 'object') {
        if (typeof process.versions.node !== 'undefined') {
            isNode = true;
        }
    }
}
if (!isNode) {
    window.Benchmark = Benchmark;
}
const child_process_1 = require("child_process");
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
                if (isNode) {
                    var fs = require('fs');
                    fs.appendFile('results.txt', '\n' + spiderBench.completeMessage + this.stats.mean + ' . ' + 'Error margin: ' + this.stats.moe, function (err) {
                    });
                }
                //This will actually be bound to type
                console.log(spiderBench.completeMessage + this.stats.mean);
                console.log("Error margin: " + this.stats.moe);
                //console.log((this as any).stats.sample.toString())
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
class BufferSocket {
    constructor(socket, messageHandler) {
        this.socket = socket;
        this.connected = false;
        this.bufferedMsgs = [];
    }
    flushMessages() {
        this.bufferedMsgs.forEach((data) => {
            this.emit(data);
        });
    }
    emit(data) {
        if (this.connected) {
            this.socket.emit('message', data);
        }
        else {
            this.bufferedMsgs.push(data);
        }
    }
    close() {
        this.socket.close();
    }
}
class ClientBufferSocket extends BufferSocket {
    constructor(port, messageHandler) {
        super(require('socket.io-client')('http://127.0.0.1:' + port), messageHandler);
        var that = this;
        this.socket.on('message', messageHandler);
        this.socket.on('connect', () => {
            that.connected = true;
            that.flushMessages();
        });
    }
}
exports.ClientBufferSocket = ClientBufferSocket;
class ServerBufferSocket extends BufferSocket {
    constructor(port, messageHandler) {
        var socket = require('socket.io')(port);
        super(socket, messageHandler);
        socket.on('connect', (client) => {
            client.on('message', messageHandler);
        });
    }
}
exports.ServerBufferSocket = ServerBufferSocket;
class SpiderBenchmark {
    constructor(name, cycleMessage, completeMessage, scheduleMessage) {
        this.name = name;
        this.cycleMessage = cycleMessage;
        this.completeMessage = completeMessage;
        this.scheduleMessage = scheduleMessage;
        this.spawnWorker = require('webworkify');
        this.spawnedNodes = [];
        this.allSockets = [];
    }
    spawnNode(filePath, messageHandler, port) {
        var instance = child_process_1.fork(__dirname + "/Server-Benchmarks/" + filePath, [port]);
        this.spawnedNodes.push(instance);
        var childSocket = new ClientBufferSocket(port, messageHandler);
        this.allSockets.push(childSocket);
        return childSocket;
    }
    setBenchDone(benchDone) {
        this.stopPromise = benchDone;
    }
    cleanWorkers(workerRefs) {
        workerRefs.forEach((worker) => {
            worker.terminate();
        });
    }
    cleanNodes() {
        this.spawnedNodes.forEach((nodeInstance) => {
            nodeInstance.kill();
        });
        this.allSockets.forEach((socket) => {
            socket.close();
        });
    }
}
SpiderBenchmark._MAIN_PORT_ = 8000;
exports.SpiderBenchmark = SpiderBenchmark;
//# sourceMappingURL=benchUtils.js.map