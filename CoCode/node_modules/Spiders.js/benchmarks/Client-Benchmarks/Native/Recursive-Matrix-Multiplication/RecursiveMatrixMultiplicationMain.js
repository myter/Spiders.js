const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 26/01/2017.
 */
class NatRecursiveMatrixMultiplicationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Recursive Matrix Multiplication", "Native Recursive Matrix Multiplication cycle completed", "Native Recursive Matrix Multiplication completed", "Native Recursive Matrix Multiplication scheduled");
        this.workerRefs = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(event) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.matMulWorkers + 1) {
                    that.masterRef.postMessage(["start"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                default:
                    console.log("Unknown message (System): " + event.data[0]);
            }
        }
        that.masterRef = that.spawnWorker(require('./RecursiveMatrixMultiplicationMaster.js'));
        that.masterRef.onmessage = sysHandle;
        that.masterRef.postMessage(["config", benchUtils_1.BenchConfig.matMulWorkers, benchUtils_1.BenchConfig.matMulDataLength]);
        var id = 0;
        var workerRefs = [];
        for (var i = 0; i < benchUtils_1.BenchConfig.matMulWorkers; i++) {
            var workerRef = that.spawnWorker(require('./RecursiveMatrixMultiplicationWorker.js'));
            workerRef.onmessage = sysHandle;
            workerRefs.push(workerRef);
            var chan = new MessageChannel();
            that.masterRef.postMessage(["newWorker", id], [chan.port2]);
            workerRef.postMessage(["config", id, benchUtils_1.BenchConfig.matMulThreshold, benchUtils_1.BenchConfig.matMulDataLength], [chan.port1]);
            id += 1;
        }
        that.masterRef.postMessage(["configDone"]);
    }
    cleanUp() {
        this.workerRefs.push(this.masterRef);
        this.cleanWorkers(this.workerRefs);
        this.workerRefs = [];
    }
}
exports.NatRecursiveMatrixMultiplicationBench = NatRecursiveMatrixMultiplicationBench;
//# sourceMappingURL=RecursiveMatrixMultiplicationMain.js.map