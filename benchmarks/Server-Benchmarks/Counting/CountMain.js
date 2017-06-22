Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 07/02/2017.
 */
class NodeCountBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node count", "Node count cycle completed", "Node count completed", "Node count scheduled");
    }
    runBenchmark() {
        var prodInitialised = false;
        var countInitialised = false;
        var that = this;
        function messageHandler(data) {
            function checkConfig() {
                if (prodInitialised && countInitialised) {
                    that.prodWorker.emit(["start"]);
                }
            }
            function prodInit() {
                prodInitialised = true;
                checkConfig();
            }
            function countInit() {
                countInitialised = true;
                checkConfig();
            }
            function countsExhausted() {
                that.stopPromise.resolve();
            }
            switch (data[0]) {
                case "prodInit":
                    prodInit();
                    break;
                case "countInit":
                    countInit();
                    break;
                case "countsExhausted":
                    countsExhausted();
                    break;
            }
        }
        this.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, messageHandler);
        this.prodWorker = this.spawnNode('Counting/CountProducer', messageHandler, NodeCountBench._PROD_WORKER_PORT_);
        this.countWorker = this.spawnNode('Counting/CountCounter', messageHandler, NodeCountBench._COUNT_WORKER_PORT);
        this.prodWorker.emit(["config", benchUtils_1.BenchConfig.count]);
        this.countWorker.emit(["config", benchUtils_1.BenchConfig.count]);
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
    }
}
NodeCountBench._PROD_WORKER_PORT_ = 8001;
NodeCountBench._COUNT_WORKER_PORT = 8002;
exports.NodeCountBench = NodeCountBench;
//# sourceMappingURL=CountMain.js.map