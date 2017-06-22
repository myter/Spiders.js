Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
class NodeAStarSearchBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node A Star Search", "Node A Star Search cycle completed", "Node A Star Search completed", "Node A Star Search scheduled");
        this.lastPort = 8002;
        this.allWorkers = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == 1 + benchUtils_1.BenchConfig.aStarWorkers) {
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
        that.masterRef = that.spawnNode("A-Star-Search/AStarSearchMaster", sysHandle, NodeAStarSearchBench._MASTER_PORT_);
        that.masterRef.emit(["config", benchUtils_1.BenchConfig.aStarWorkers, benchUtils_1.BenchConfig.aStarGridSize]);
        var id = 0;
        for (var i = 0; i < benchUtils_1.BenchConfig.aStarWorkers; i++) {
            var workerRef = that.spawnNode("A-Star-Search/AStarSearchWorker", sysHandle, that.lastPort);
            that.allWorkers.push(workerRef);
            that.masterRef.emit(["addWorker", id, that.lastPort]);
            workerRef.emit(["config", benchUtils_1.BenchConfig.aStarThreshold, benchUtils_1.BenchConfig.aStarGridSize, NodeAStarSearchBench._MASTER_PORT_]);
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
NodeAStarSearchBench._MASTER_PORT_ = 8001;
exports.NodeAStarSearchBench = NodeAStarSearchBench;
//# sourceMappingURL=AStarSearchMain.js.map