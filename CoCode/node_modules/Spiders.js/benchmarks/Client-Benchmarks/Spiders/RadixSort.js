const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class Validation extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.dataSize = 0;
        this.sumSoFar = 0;
        this.valueSoFar = 0;
        this.prevValue = 0;
        this.errorValue1 = -1;
        this.errorValue2 = -1;
    }
    config(dataSize) {
        this.dataSize = dataSize;
        this.parent.actorInit();
    }
    value(candidate) {
        this.valueSoFar += 1;
        if (candidate < this.prevValue && this.errorValue1 < 0) {
            this.errorValue2 = candidate;
            this.errorValue1 = this.valueSoFar - 1;
        }
        this.prevValue = candidate;
        this.sumSoFar += this.prevValue;
        if (this.valueSoFar == this.dataSize) {
            this.parent.actorExit();
        }
    }
}
class Sort extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.dataSize = 0;
        this.radix = 0;
        this.nextRef = null;
        this.valueSoFar = 0;
        this.j = 0;
        this.ordering = [];
    }
    config(dataSize, radix, nextRef) {
        this.dataSize = dataSize;
        this.radix = radix;
        this.nextRef = nextRef;
        this.parent.actorInit();
    }
    value(candidate) {
        this.valueSoFar += 1;
        var current = candidate;
        if ((current & this.radix) == 0) {
            this.nextRef.value(candidate);
        }
        else {
            this.ordering[this.j] = candidate;
            this.j += 1;
        }
        if (this.valueSoFar == this.dataSize) {
            var i = 0;
            while (i < this.j) {
                this.nextRef.value(this.ordering[i]);
                i++;
            }
            this.parent.actorExit();
        }
    }
}
class Source extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.dataSize = 0;
        this.maxValue = 0;
    }
    config(dataSize, maxValue) {
        this.dataSize = dataSize;
        this.maxValue = maxValue;
        this.parent.actorInit();
    }
    getRandom(upper) {
        return Math.floor(Math.random() * (upper - 0) + 0);
    }
    nextActor(nextRef) {
        var i = 0;
        while (i < this.dataSize) {
            var candidate = this.getRandom(100000) % this.maxValue;
            nextRef.value(candidate);
            i++;
        }
        this.parent.actorExit();
    }
}
class RadixSortApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.actorsExited = 0;
        this.bench = bench;
    }
    setup() {
        this.sourceRef = this.spawnActor(Source);
        this.sourceRef.config(benchUtils_1.BenchConfig.radixSortDataSize, benchUtils_1.BenchConfig.radixSortMaxVal);
        var validRef = this.spawnActor(Validation);
        validRef.config(benchUtils_1.BenchConfig.radixSortDataSize);
        this.totalActors = 2;
        var radix = Math.floor(benchUtils_1.BenchConfig.radixSortMaxVal / 2);
        this.nextActor = validRef;
        while (Math.floor(radix) > 0) {
            var localRadix = radix;
            var localNextActor = this.nextActor;
            var sortRef = this.spawnActor(Sort);
            sortRef.config(benchUtils_1.BenchConfig.radixSortDataSize, localRadix, localNextActor);
            radix = radix / 2;
            this.totalActors += 1;
            this.nextActor = sortRef;
        }
    }
    checkConfig() {
        if (this.actorsInitialised == this.totalActors) {
            this.sourceRef.nextActor(this.nextActor);
        }
    }
    actorInit() {
        this.actorsInitialised += 1;
        this.checkConfig();
    }
    actorExit() {
        this.actorsExited += 1;
        if (this.actorsExited == this.totalActors) {
            this.bench.stopPromise.resolve();
        }
    }
    end() {
        this.bench.stopPromise.resolve();
    }
}
class SpiderRadixSortBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Radix Sort", "Spiders.js Radix Sort cycle completed", "Spiders.js Radix Sort completed", "Spiders.js Radix Sort scheduled");
    }
    runBenchmark() {
        this.radixSortApp = new RadixSortApp(this);
        this.radixSortApp.setup();
    }
    cleanUp() {
        this.radixSortApp.kill();
    }
}
exports.SpiderRadixSortBench = SpiderRadixSortBench;
//# sourceMappingURL=RadixSort.js.map