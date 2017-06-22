Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
class NodeRecursiveMatrixMultiplicationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Recursive Matrix Multiplication", "Node Recursive Matrix Multiplication cycle completed", "Node Recursive Matrix Multiplication completed", "Node Recursive Matrix Multiplication scheduled");
        this.lastPort = 8002;
        this.workerRefs = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.matMulWorkers + 1) {
                    that.masterRef.emit(["start"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                default:
                    console.log("Unknown message (System): " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.masterRef = that.spawnNode("Recursive-Matrix-Multiplication/RecursiveMatrixMultiplicationMaster", sysHandle, NodeRecursiveMatrixMultiplicationBench._MASTER_PORT_);
        that.masterRef.emit(["config", benchUtils_1.BenchConfig.matMulWorkers, benchUtils_1.BenchConfig.matMulDataLength]);
        var id = 0;
        var workerRefs = [];
        for (var i = 0; i < benchUtils_1.BenchConfig.matMulWorkers; i++) {
            var workerRef = that.spawnNode("Recursive-Matrix-Multiplication/RecursiveMatrixMultiplicationWorker", sysHandle, that.lastPort);
            workerRefs.push(workerRef);
            that.masterRef.emit(["newWorker", id, that.lastPort]);
            workerRef.emit(["config", id, benchUtils_1.BenchConfig.matMulThreshold, benchUtils_1.BenchConfig.matMulDataLength, NodeRecursiveMatrixMultiplicationBench._MASTER_PORT_]);
            id += 1;
            that.lastPort++;
        }
        that.masterRef.emit(["configDone"]);
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.workerRefs = [];
    }
}
NodeRecursiveMatrixMultiplicationBench._MASTER_PORT_ = 8001;
exports.NodeRecursiveMatrixMultiplicationBench = NodeRecursiveMatrixMultiplicationBench;
//# sourceMappingURL=RecursiveMatrixMultiplicationMain.js.map