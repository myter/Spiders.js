Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
class NodeRadixSortBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Radix Sort", "Node Radix Sort cycle completed", "Node Radix Sort completed", "Node Radix Sort scheduled");
        this.lastPort = 8003;
        this.allActors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var actorsExited = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == totalActors) {
                    nextActor.emit(["link", NodeRadixSortBench._SOURCE_PORT_]);
                    that.sourceRef.emit(["nextActor", nextPort]);
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
            switch (data[0]) {
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
                    console.log("Unknown message: " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.sourceRef = that.spawnNode("Radix-Sort/RadixSortSource", sysHandle, NodeRadixSortBench._SOURCE_PORT_);
        that.sourceRef.emit(["config", benchUtils_1.BenchConfig.radixSortDataSize, benchUtils_1.BenchConfig.radixSortMaxVal]);
        that.validRef = that.spawnNode("Radix-Sort/RadixSortValidation", sysHandle, NodeRadixSortBench._VALID_PORT_);
        that.validRef.emit(["config", benchUtils_1.BenchConfig.radixSortDataSize]);
        var totalActors = 2;
        var radix = Math.floor(benchUtils_1.BenchConfig.radixSortMaxVal / 2);
        var nextActor = that.validRef;
        var nextPort = NodeRadixSortBench._VALID_PORT_;
        while (Math.floor(radix) > 0) {
            var localRadix = radix;
            var localNextActor = nextActor;
            var localNextPort = nextPort;
            var sortRef = that.spawnNode("Radix-Sort/RadixSortSort", sysHandle, that.lastPort);
            that.allActors.push(sortRef);
            localNextActor.emit(["link", that.lastPort]);
            sortRef.emit(["config", benchUtils_1.BenchConfig.radixSortDataSize, localRadix, localNextPort]);
            radix = radix / 2;
            totalActors += 1;
            nextActor = sortRef;
            nextPort = that.lastPort;
            that.lastPort++;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.allActors = [];
    }
}
NodeRadixSortBench._SOURCE_PORT_ = 8001;
NodeRadixSortBench._VALID_PORT_ = 8002;
exports.NodeRadixSortBench = NodeRadixSortBench;
//# sourceMappingURL=RadixSortMain.js.map