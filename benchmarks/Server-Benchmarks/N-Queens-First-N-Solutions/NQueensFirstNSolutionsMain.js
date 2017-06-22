Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
class NodeNQueensFirstNSolutionsBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node N Queens First N Solutions", "Node N Queens First N Solutions cycle completed", "Node N Queens First N Solutions completed", "Node N Queens First N Solutions scheduled");
        this.lastPort = 8002;
        this.allWorkers = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == 1 + benchUtils_1.BenchConfig.nQueensWorkers) {
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
        that.masterRef = that.spawnNode("N-Queens-First-N-Solutions/NQueensFirstNSolutionsMaster", sysHandle, NodeNQueensFirstNSolutionsBench._MASTER_PORT_);
        that.masterRef.emit(["config", benchUtils_1.BenchConfig.nQueensSolutions, benchUtils_1.BenchConfig.nQueensPriorities, benchUtils_1.BenchConfig.nQueensWorkers]);
        var id = 0;
        for (var i = 0; i < benchUtils_1.BenchConfig.nQueensWorkers; i++) {
            var workerRef = that.spawnNode("N-Queens-First-N-Solutions/NQueensFirstNSolutionsWorker", sysHandle, that.lastPort);
            that.allWorkers.push(workerRef);
            workerRef.emit(["config", id, benchUtils_1.BenchConfig.nQueensThreshold, benchUtils_1.BenchConfig.nQueensSize, NodeNQueensFirstNSolutionsBench._MASTER_PORT_]);
            that.masterRef.emit(["addWorker", id, that.lastPort]);
            id += 1;
            that.lastPort++;
        }
        that.masterRef.emit(["configDone"]);
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.allWorkers = [];
    }
}
NodeNQueensFirstNSolutionsBench._MASTER_PORT_ = 8001;
exports.NodeNQueensFirstNSolutionsBench = NodeNQueensFirstNSolutionsBench;
//# sourceMappingURL=NQueensFirstNSolutionsMain.js.map