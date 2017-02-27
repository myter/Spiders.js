const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 26/01/2017.
 */
class NatQuicksortBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Quicksort", "Native Quicksort cycle completed", "Native Quicksort completed", "Native Quicksort scheduled");
        this.spawned = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(event) {
            function checkConfig() {
                if (actorsInitialised == 1) {
                    that.quickRef.postMessage(["sort"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            function spawnNew(parentRef, position) {
                var chan = new MessageChannel();
                parentRef.postMessage(["childSpawned", position], [chan.port2]);
                var qRef = that.spawnWorker(require('./QuicksortActor.js'));
                that.spawned.push(qRef);
                qRef.onmessage = sysHandle;
                qRef.postMessage(["config", true, benchUtils_1.BenchConfig.matMulWorkers, benchUtils_1.BenchConfig.matMulDataLength, benchUtils_1.BenchConfig.matMulThreshold, position], [chan.port1]);
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                case "spawnNew":
                    spawnNew(event.ports[0], event.data[1]);
                    break;
                default:
                    console.log("Unknown message (System): " + event.data[0]);
            }
        }
        that.quickRef = that.spawnWorker(require('./QuicksortActor.js'));
        that.quickRef.onmessage = sysHandle;
        that.quickRef.postMessage(["config", false, benchUtils_1.BenchConfig.matMulWorkers, benchUtils_1.BenchConfig.matMulDataLength, benchUtils_1.BenchConfig.matMulThreshold, 0, "INITIAL"]);
        for (var i = 0; i < benchUtils_1.BenchConfig.matMulWorkers; i++) {
            var data = Math.floor(Math.random() * (benchUtils_1.BenchConfig.matMulDataLength - 0) + 0) % benchUtils_1.BenchConfig.matMulDataLength;
            that.quickRef.postMessage(["newData", data]);
        }
        that.quickRef.postMessage(["configDone"]);
    }
    cleanUp() {
        this.spawned.push(this.quickRef);
        this.cleanWorkers(this.spawned);
        this.spawned = [];
    }
}
exports.NatQuicksortBench = NatQuicksortBench;
//# sourceMappingURL=QuicksortMain.js.map