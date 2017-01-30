const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class Combine extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.sinkRef = null;
        this.sum = 0;
    }
    config(sinkRef) {
        this.sinkRef = sinkRef;
        this.parent.actorInit();
    }
    newVal(val) {
        this.sum += val;
    }
    valEnd() {
        this.sinkRef.valueMessage(this.sum);
        this.sum = 0;
    }
}
class Integrator extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.totalChannels = null;
        this.combineRef = null;
        this.data = {};
        this.dataIndex = 0;
        this.exitsReceived = 0;
    }
    config(totalChannels, combineRef) {
        this.totalChannels = totalChannels;
        this.combineRef = combineRef;
        this.parent.actorInit();
    }
    removeEntry(key) {
        var copy = {};
        for (var i in this.data) {
            if (!(i == key)) {
                copy[key] = this.data[key];
            }
        }
        this.data = copy;
    }
    sourceValueMessage(sourceId, val) {
        var dataSize = 0;
        for (var i in this.data) {
            dataSize += 1;
        }
        var processed = false;
        var j = 0;
        while (j < dataSize) {
            var loopMap = this.data[j];
            if (!(sourceId in loopMap)) {
                loopMap[sourceId] = val;
                processed = true;
                j = dataSize;
            }
            j += 1;
        }
        if (!processed) {
            var newMap = {};
            newMap[sourceId] = val;
            this.data[this.dataIndex] = newMap;
            this.dataIndex += 1;
        }
        var firstMap = this.data[0];
        var firstMapSize = 0;
        for (var i in firstMap) {
            firstMapSize += 1;
        }
        if (firstMapSize == this.totalChannels) {
            for (var i in firstMap) {
                this.combineRef.newVal(firstMap[i]);
            }
            this.combineRef.valEnd();
            this.removeEntry(0);
        }
    }
    exit() {
        this.exitsReceived += 1;
        if (this.exitsReceived == this.totalChannels) {
            this.parent.end();
        }
    }
}
class TaggedForward extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.sourceId = null;
        this.nextRef = null;
    }
    config(sourceId, nextRef) {
        this.sourceId = sourceId;
        this.nextRef = nextRef;
        this.parent.actorInit();
    }
    valueMessage(val) {
        this.nextRef.sourceValueMessage(this.sourceId, val);
    }
    exit() {
        this.nextRef.exit();
    }
}
class SampleFilter extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.sampleRate = null;
        this.nextRef = null;
        this.samplesReceived = 0;
    }
    config(sampleRate, nextRef) {
        this.sampleRate = sampleRate;
        this.nextRef = nextRef;
        this.parent.actorInit();
    }
    valueMessage(val) {
        if (this.samplesReceived == 0) {
            this.nextRef.valueMessage(val);
        }
        else {
            this.nextRef.valueMessage(0);
        }
        this.samplesReceived = (this.samplesReceived + 1) % this.sampleRate;
    }
    exit() {
        this.nextRef.exit();
    }
}
class FirFilter extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.sourceId = null;
        this.peekLength = null;
        this.coef = [];
        this.nextRef = null;
        this.data = [];
        this.dataIndex = 0;
        this.dataFull = false;
    }
    config(sourceId, peekLength, nextRef) {
        this.sourceId = sourceId;
        this.peekLength = peekLength;
        this.nextRef = nextRef;
        for (var i = 0; i < peekLength; i++) {
            this.data[i] = 0;
        }
    }
    newCoef(c) {
        this.coef.push(c);
    }
    configDone() {
        this.parent.actorInit();
    }
    valueMessage(val) {
        this.data[this.dataIndex] = val;
        this.dataIndex += 1;
        if (this.dataIndex == this.peekLength) {
            this.dataFull = true;
            this.dataIndex = 0;
        }
        if (this.dataFull) {
            var sum = 0.0;
            var i = 0;
            while (i < this.peekLength) {
                sum += this.data[i] * this.coef[this.peekLength - i - 1];
                i += 1;
            }
            this.nextRef.valueMessage(sum);
        }
    }
    exit() {
        this.nextRef.exit();
    }
}
class Delay extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.sourceId = null;
        this.delayLength = null;
        this.nextRef = null;
        this.state = [];
        this.placeHolder = 0;
    }
    config(sourceId, delayLength, nextRef) {
        this.sourceId = sourceId;
        this.delayLength = delayLength;
        this.nextRef = nextRef;
        for (var i = 0; i < delayLength; i++) {
            this.state[i] = 0;
        }
        this.parent.actorInit();
    }
    valueMessage(val) {
        this.nextRef.valueMessage(this.state[this.placeHolder]);
        this.state[this.placeHolder] = val;
        this.placeHolder = (this.placeHolder + 1) % this.delayLength;
    }
    exit() {
        this.nextRef.exit();
    }
}
class Bank extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.id = null;
        this.totalColumns = null;
        this.integrateRef = null;
        this.firstRef = null;
    }
    config(id, totalColumns, integrateRef, firstRef) {
        this.id = id;
        this.totalColumns = totalColumns;
        this.integrateRef = integrateRef;
        this.firstRef = firstRef;
        this.parent.actorInit();
    }
    valueMessage(val) {
        this.firstRef.valueMessage(val);
    }
    exit() {
        this.firstRef.exit();
    }
}
class Branch extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.banks = [];
        this.integrateRef = null;
    }
    config(integrateRef) {
        this.integrateRef = integrateRef;
    }
    newBank(bankRef) {
        this.banks.push(bankRef);
    }
    configDone() {
        this.parent.actorInit();
    }
    valueMessage(val) {
        this.banks.forEach((bank) => {
            bank.valueMessage(val);
        });
    }
    exit() {
        this.banks.forEach((bank) => {
            bank.exit();
        });
    }
}
class Sink extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.count = 0;
    }
    init() {
        this.parent.actorInit();
    }
    valueMessage(val) {
        this.count += 1;
    }
}
class Source extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.producerRef = null;
        this.branchesRef = null;
        this.maxValue = 1000;
        this.current = 0;
    }
    config(producerRef, branchesRef) {
        this.producerRef = producerRef;
        this.branchesRef = branchesRef;
        this.parent.actorInit();
    }
    boot() {
        this.branchesRef.valueMessage(this.current);
        this.current = (this.current + 1) % this.maxValue;
        this.producerRef.nextMessage();
    }
    exit() {
        this.branchesRef.exit();
    }
}
class Producer extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.sourceRef = null;
        this.totalSimulations = null;
        this.messagesSent = 0;
    }
    config(totalSimulations, sourceRef) {
        this.totalSimulations = totalSimulations;
        this.sourceRef = sourceRef;
        this.parent.actorInit();
    }
    nextMessage() {
        if (this.messagesSent == this.totalSimulations) {
            this.sourceRef.exit();
        }
        else {
            this.sourceRef.boot();
            this.messagesSent += 1;
        }
    }
}
class FilterBankApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.bench = bench;
    }
    setup() {
        this.producerRef = this.spawnActor(Producer);
        var sinkRef = this.spawnActor(Sink);
        var combineRef = this.spawnActor(Combine);
        combineRef.config(sinkRef);
        var integrateRef = this.spawnActor(Integrator);
        integrateRef.config(benchUtils_1.BenchConfig.filterBankChannels, combineRef);
        var branchesRef = this.spawnActor(Branch);
        branchesRef.config(integrateRef);
        var H = {};
        var F = {};
        for (var j = 0; j < benchUtils_1.BenchConfig.filterBankChannels; j++) {
            H[j] = {};
            F[j] = {};
            for (var i = 0; i < benchUtils_1.BenchConfig.filterBankColumns; i++) {
                H[j][i] = (1.0 * i * benchUtils_1.BenchConfig.filterBankColumns) + (1.0 * j * benchUtils_1.BenchConfig.filterBankChannels) + j + i + j + 1;
                F[j][i] = (1.0 * i * j) + (1.0 * j * j) + j + i;
            }
        }
        for (var i = 0; i < benchUtils_1.BenchConfig.filterBankChannels; i++) {
            var taggedRef = this.spawnActor(TaggedForward);
            taggedRef.config(i, integrateRef);
            var firFilt2Ref = this.spawnActor(FirFilter);
            firFilt2Ref.config(i + ".2", benchUtils_1.BenchConfig.filterBankColumns, taggedRef);
            for (var c in F[i]) {
                firFilt2Ref.newCoef(F[i][c]);
            }
            firFilt2Ref.configDone();
            var delayRef = this.spawnActor(Delay);
            delayRef.config(i + ".2", benchUtils_1.BenchConfig.filterBankColumns - 1, firFilt2Ref);
            var sampleFiltRef = this.spawnActor(SampleFilter);
            sampleFiltRef.config(benchUtils_1.BenchConfig.filterBankColumns, delayRef);
            var firFiltRef = this.spawnActor(FirFilter);
            firFiltRef.config(i + ".1", benchUtils_1.BenchConfig.filterBankColumns, sampleFiltRef);
            for (var c in H[i]) {
                firFiltRef.newCoef(H[i][c]);
            }
            firFiltRef.configDone();
            var firstRef = this.spawnActor(Delay);
            firstRef.config(i + ".1", benchUtils_1.BenchConfig.filterBankColumns - 1, firFiltRef);
            var bankRef = this.spawnActor(Bank);
            bankRef.config(i, benchUtils_1.BenchConfig.filterBankColumns, integrateRef, firstRef);
            branchesRef.newBank(bankRef);
        }
        branchesRef.configDone();
        var sourceRef = this.spawnActor(Source);
        sourceRef.config(this.producerRef, branchesRef);
        this.producerRef.config(benchUtils_1.BenchConfig.filterBankSimulations, sourceRef);
    }
    checkConfig() {
        if (this.actorsInitialised == 6 + benchUtils_1.BenchConfig.filterBankChannels + benchUtils_1.BenchConfig.filterBankChannels * 6) {
            this.producerRef.nextMessage();
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
class SpiderFilterBankBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Filter Bank", "Spiders.js Filter Bank cycle completed", "Spiders.js Filter Bank completed", "Spiders.js Filter Bank scheduled");
    }
    runBenchmark() {
        this.filterBankApp = new FilterBankApp(this);
        this.filterBankApp.setup();
    }
    cleanUp() {
        this.filterBankApp.kill();
    }
}
exports.SpiderFilterBankBench = SpiderFilterBankBench;
//# sourceMappingURL=FilterBank.js.map