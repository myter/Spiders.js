Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
class NodePrecisePiComputationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Precise Pi Computation", "Node Precise Pi Computation cycle completed", "Node Precise Pi Computation completed", "Node Precise Pi Computation scheduled");
        this.lastPort = 8002;
        this.workerRefs = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.piPrecisionWorkers + 1) {
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
        that.masterRef = that.spawnNode("Precise-Pi-Computation/PrecisePiComputationMaster", sysHandle, NodePrecisePiComputationBench._MASTER_PORT_);
        that.masterRef.emit(["config", benchUtils_1.BenchConfig.piPrecisionWorkers, benchUtils_1.BenchConfig.piPrecisionPrecision]);
        var id = 0;
        for (var i = 0; i < benchUtils_1.BenchConfig.piPrecisionWorkers; i++) {
            var workerRef = that.spawnNode("Precise-Pi-Computation/PrecisePiComputationWorker", sysHandle, that.lastPort);
            that.workerRefs.push(workerRef);
            that.masterRef.emit(["newWorker", id, that.lastPort]);
            workerRef.emit(["config", id, NodePrecisePiComputationBench._MASTER_PORT_]);
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
NodePrecisePiComputationBench._MASTER_PORT_ = 8001;
exports.NodePrecisePiComputationBench = NodePrecisePiComputationBench;
//# sourceMappingURL=PrecisePiComputationMain.js.map