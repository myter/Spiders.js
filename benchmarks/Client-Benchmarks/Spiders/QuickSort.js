Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 01/02/2017.
 */
var spiders = require("../../../src/spiders");
class Quick extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.dataSize = null;
        this.maxVal = null;
        this.threshold = null;
        this.parentRef = null;
        this.position = null;
        this.data = [];
        this.result = [];
        this.numFragments = 0;
        this.exited = false;
    }
    config(hasParent, dataSize, maxVal, threshold, parentRef, position) {
        if (hasParent) {
            this.parentRef = parentRef;
        }
        this.dataSize = dataSize;
        this.maxVal = maxVal;
        this.threshold = threshold;
        this.position = position;
    }
    newData(dataPoint) {
        this.data.push(dataPoint);
    }
    configDone() {
        this.parent.actorInit();
    }
    sequentialSort(dataCopy) {
        var dataLength = dataCopy.length;
        if (dataLength < 2) {
            return dataCopy;
        }
        else {
            var pivot = dataCopy[Math.floor(dataLength / 2)];
            var leftUnsorted = this.filterLessThan(dataCopy, pivot);
            var leftSorted = this.sequentialSort(leftUnsorted);
            var equalElements = this.filterEqualsTo(dataCopy, pivot);
            var rightUnsorted = this.filterGreaterThan(dataCopy, pivot);
            var rightSorted = this.sequentialSort(rightUnsorted);
            var sorted = [];
            for (var i in rightUnsorted) {
                sorted.push(rightUnsorted[i]);
            }
            for (var i in equalElements) {
                sorted.push(equalElements[i]);
            }
            for (var i in leftUnsorted) {
                sorted.push(leftUnsorted[i]);
            }
            return sorted;
        }
    }
    notifyParentAndTerminate() {
        if (this.parentRef != null) {
            this.parentRef.gotResult(this.result, this.position);
        }
        else {
            this.parent.end();
        }
        this.exited = true;
    }
    filterLessThan(dataCopy, pivot) {
        var dataLength = dataCopy.length;
        var result = [];
        for (var i in dataCopy) {
            if (dataCopy[i] < pivot) {
                result.push(dataCopy[i]);
            }
        }
        return result;
    }
    filterGreaterThan(dataCopy, pivot) {
        var dataLength = dataCopy.length;
        var result = [];
        for (var i in dataCopy) {
            if (dataCopy[i] > pivot) {
                result.push(dataCopy[i]);
            }
        }
        return result;
    }
    filterEqualsTo(dataCopy, pivot) {
        var dataLength = dataCopy.length;
        var result = [];
        for (var i in dataCopy) {
            if (dataCopy[i] == pivot) {
                result.push(dataCopy[i]);
            }
        }
        return result;
    }
    childSpawned(ref, position) {
        var data = this.data;
        var dataLengthHalf = Math.floor(data.length / 2);
        var pivot = data[dataLengthHalf];
        var leftUnsorted = this.filterLessThan(data, pivot);
        var rightUnsorted = this.filterGreaterThan(data, pivot);
        if (position == "LEFT") {
            for (var i in leftUnsorted) {
                ref.newData(leftUnsorted[i]);
            }
        }
        else {
            for (var i in rightUnsorted) {
                ref.newData(rightUnsorted[i]);
            }
        }
        ref.configDone();
        ref.sort();
    }
    sort() {
        var data = this.data;
        if (!this.exited) {
            var dataLength = data.length;
            if (dataLength < this.threshold) {
                this.sequentialSort(data);
                this.notifyParentAndTerminate();
            }
            else {
                var dataLengthHalf = dataLength / 2;
                var pivot = data[dataLengthHalf];
                this.parent.spawnNew(this, "LEFT").then((ref) => {
                    var dataLengthHalf = dataLength / 2;
                    var pivot = data[dataLengthHalf];
                    var leftUnsorted = this.filterLessThan(data, pivot);
                    leftUnsorted.forEach((uns) => {
                        ref.newData(uns);
                    });
                    ref.configDone();
                    ref.sort();
                });
                this.parent.spawnNew(this, "RIGHT").then((ref) => {
                    var dataLengthHalf = dataLength / 2;
                    var pivot = data[dataLengthHalf];
                    var rightUnsorted = this.filterGreaterThan(data, pivot);
                    rightUnsorted.forEach((uns) => {
                        ref.newData(uns);
                    });
                    ref.configDone();
                    ref.sort();
                });
                this.result = this.filterEqualsTo(data, pivot);
                this.numFragments += 1;
            }
        }
    }
    gotResult(result, fromPosition) {
        if (!(this.data.length == 0)) {
            if (fromPosition == "LEFT") {
                var tempLeft = this.result + result;
                this.result = tempLeft;
            }
            else if (fromPosition == "RIGHT") {
                var tempRight = result + this.result;
                this.result = tempRight;
            }
        }
        this.numFragments += 1;
        if (this.numFragments == 3) {
            this.notifyParentAndTerminate();
        }
    }
}
class QuickSortApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.totalSpawned = 1;
        this.bench = bench;
    }
    setup() {
        this.quickRef = this.spawnActor(Quick);
        this.quickRef.config(false, benchUtils_1.BenchConfig.quickDataSize, benchUtils_1.BenchConfig.quickMaxVal, benchUtils_1.BenchConfig.quickThreshold, 0, "INITIAL");
        for (var i = 0; i < benchUtils_1.BenchConfig.quickDataSize; i++) {
            var data = Math.floor(Math.random() * (benchUtils_1.BenchConfig.quickMaxVal - 0) + 0) % benchUtils_1.BenchConfig.quickMaxVal;
            this.quickRef.newData(data);
        }
        this.quickRef.configDone();
    }
    checkConfig() {
        if (this.actorsInitialised == 1) {
            this.quickRef.sort();
        }
    }
    actorInit() {
        this.actorsInitialised += 1;
        this.checkConfig();
    }
    end() {
        this.bench.stopPromise.resolve();
    }
    spawnNew(parentRef, position) {
        var qRef = this.spawnActor(Quick);
        qRef.config(true, benchUtils_1.BenchConfig.quickDataSize, benchUtils_1.BenchConfig.quickMaxVal, benchUtils_1.BenchConfig.quickThreshold, parentRef, position);
        this.totalSpawned += 1;
        //parentRef.childSpawned(qRef,position)
        return qRef;
    }
}
class SpiderQuickSortBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Quick Sort", "Spiders.js Quick Sort cycle completed", "Spiders.js Quick Sort completed", "Spiders.js Quick Sort scheduled");
    }
    runBenchmark() {
        this.quickSortApp = new QuickSortApp(this);
        this.quickSortApp.setup();
    }
    cleanUp() {
        this.quickSortApp.kill();
    }
}
exports.SpiderQuickSortBench = SpiderQuickSortBench;
//# sourceMappingURL=QuickSort.js.map