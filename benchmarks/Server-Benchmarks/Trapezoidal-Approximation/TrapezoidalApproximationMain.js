Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
class NodeTrapezoidalApproximationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Trapezoidal Approximation", "Node Trapezoidal Approximation cycle completed", "Node Trapezoidal Approximation completed", "Node Trapezoidal Approximation scheduled");
        this.lastPort = 8002;
        this.workerRefs = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var actorsExited = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.trapezoidWorkers + 1) {
                    that.masterRef.emit(["work"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function actorExit() {
                actorsExited += 1;
                if (actorsExited == (benchUtils_1.BenchConfig.trapezoidWorkers + 1)) {
                    that.stopPromise.resolve();
                }
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "actorExit":
                    actorExit();
                    break;
                default:
                    console.log("Unknown message (System): " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.masterRef = that.spawnNode("Trapezoidal-Approximation/TrapezoidalApproximationMaster", sysHandle, NodeTrapezoidalApproximationBench._MASTER_PORT_);
        var precision = (benchUtils_1.BenchConfig.trapezoidRight - benchUtils_1.BenchConfig.trapezoidLeft) / benchUtils_1.BenchConfig.trapezoidPieces;
        that.masterRef.emit(["config", benchUtils_1.BenchConfig.trapezoidLeft, benchUtils_1.BenchConfig.trapezoidRight, precision]);
        var id = 0;
        for (var i = 0; i < benchUtils_1.BenchConfig.trapezoidWorkers; i++) {
            var workerRef = that.spawnNode("Trapezoidal-Approximation/TrapezoidalApproximationWorker", sysHandle, that.lastPort);
            that.workerRefs.push(workerRef);
            that.masterRef.emit(["newWorker", that.lastPort]);
            workerRef.emit(["config", id, NodeTrapezoidalApproximationBench._MASTER_PORT_]);
            that.lastPort++;
            id += 1;
        }
        that.masterRef.emit(["configDone"]);
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.workerRefs = [];
    }
}
NodeTrapezoidalApproximationBench._MASTER_PORT_ = 8001;
exports.NodeTrapezoidalApproximationBench = NodeTrapezoidalApproximationBench;
//# sourceMappingURL=TrapezoidalApproximationMain.js.map