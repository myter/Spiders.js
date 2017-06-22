Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
class NodeQuicksortBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Quicksort", "Node Quicksort cycle completed", "Node Quicksort completed", "Node Quicksort scheduled");
        this.lastPort = 8002;
        this.spawned = new Map();
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == 1) {
                    that.quickRef.emit(["sort"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            function spawnNew(position, parentPort) {
                var qRef = that.spawnNode("Quicksort/QuicksortActor", sysHandle, that.lastPort);
                that.spawned.set(that.lastPort, qRef);
                qRef.emit(["config", true, benchUtils_1.BenchConfig.quickDataSize, benchUtils_1.BenchConfig.quickMaxVal, benchUtils_1.BenchConfig.quickThreshold, position, parentPort]);
                var parentRef = that.spawned.get(parentPort);
                parentRef.emit(["childSpawned", position, that.lastPort]);
                that.lastPort++;
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                case "spawnNew":
                    spawnNew(data[1], data[2]);
                    break;
                default:
                    console.log("Unknown message (System): " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.quickRef = that.spawnNode("Quicksort/QuicksortActor", sysHandle, NodeQuicksortBench._QUICK_PORT_);
        that.spawned.set(NodeQuicksortBench._QUICK_PORT_, that.quickRef);
        that.quickRef.emit(["config", false, benchUtils_1.BenchConfig.quickDataSize, benchUtils_1.BenchConfig.quickMaxVal, benchUtils_1.BenchConfig.quickThreshold, 0, "INITIAL"]);
        for (var i = 0; i < benchUtils_1.BenchConfig.quickDataSize; i++) {
            var dat = Math.floor(Math.random() * (benchUtils_1.BenchConfig.quickMaxVal - 0) + 0) % benchUtils_1.BenchConfig.quickMaxVal;
            that.quickRef.emit(["newData", dat]);
        }
        that.quickRef.emit(["configDone"]);
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.spawned = new Map();
    }
}
NodeQuicksortBench._QUICK_PORT_ = 8001;
exports.NodeQuicksortBench = NodeQuicksortBench;
//# sourceMappingURL=QuicksortMain.js.map