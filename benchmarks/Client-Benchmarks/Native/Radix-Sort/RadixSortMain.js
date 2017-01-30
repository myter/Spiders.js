const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 26/01/2017.
 */
class NatRadixSortBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Radix Sort", "Native Radix Sort cycle completed", "Native Radix Sort completed", "Native Radix Sort scheduled");
        this.allActors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var actorsExited = 0;
        var that = this;
        function sysHandle(event) {
            function checkConfig() {
                if (actorsInitialised == totalActors) {
                    var chan = new MessageChannel();
                    nextActor.postMessage(["link"], [chan.port2]);
                    that.sourceRef.postMessage(["nextActor"], [chan.port1]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function actorExit() {
                actorsExited += 1;
                if (actorsExited == totalActors) {
                    that.stopPromise.resolve();
                }
            }
            function end() {
                that.stopPromise.resolve();
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "actorExit":
                    actorExit();
                    break;
                case "end":
                    end();
                    break;
                default:
                    console.log("Unknown message: " + event.data[0]);
            }
        }
        that.sourceRef = that.spawnWorker(require('./RadixSortSource.js'));
        that.sourceRef.onmessage = sysHandle;
        that.sourceRef.postMessage(["config", benchUtils_1.BenchConfig.radixSortDataSize, benchUtils_1.BenchConfig.radixSortMaxVal]);
        that.validRef = that.spawnWorker(require('./RadixSortValidation.js'));
        that.validRef.onmessage = sysHandle;
        that.validRef.postMessage(["config", benchUtils_1.BenchConfig.radixSortDataSize]);
        var totalActors = 2;
        var radix = Math.floor(benchUtils_1.BenchConfig.radixSortMaxVal / 2);
        var nextActor = that.validRef;
        while (Math.floor(radix) > 0) {
            var localRadix = radix;
            var localNextActor = nextActor;
            var sortRef = that.spawnWorker(require('./RadixSortSort.js'));
            that.allActors.push(sortRef);
            sortRef.onmessage = sysHandle;
            var chan = new MessageChannel();
            localNextActor.postMessage(["link"], [chan.port2]);
            sortRef.postMessage(["config", benchUtils_1.BenchConfig.radixSortDataSize, localRadix], [chan.port1]);
            radix = radix / 2;
            totalActors += 1;
            nextActor = sortRef;
        }
    }
    cleanUp() {
        this.allActors.push(this.sourceRef);
        this.allActors.push(this.validRef);
        this.cleanWorkers(this.allActors);
        this.allActors = [];
    }
}
exports.NatRadixSortBench = NatRadixSortBench;
//# sourceMappingURL=RadixSortMain.js.map