Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
class NodeProducerConsumerBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Producer Consumer", "Node Producer Consumer cycle completed", "Node Producer Consumer completed", "Node Producer Consumer scheduled");
        this.lastPort = 8002;
        this.producers = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandler(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.prodConProd + benchUtils_1.BenchConfig.prodConCon + 1) {
                    for (var i in that.producers) {
                        that.producers[i].emit(["produce"]);
                    }
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
                    console.log("Unknown message: " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandler);
        that.managerRef = that.spawnNode("Producer-Consumer/ProducerConsumerManager", sysHandler, NodeProducerConsumerBench._MANAGER_PORT_);
        that.managerRef.emit(["config", benchUtils_1.BenchConfig.prodConBuffer, benchUtils_1.BenchConfig.prodConCon, benchUtils_1.BenchConfig.prodConProd]);
        var prodCount = benchUtils_1.BenchConfig.prodConProd;
        while (prodCount > 0) {
            var newProd = that.spawnNode("Producer-Consumer/ProducerConsumerProducer", sysHandler, that.lastPort);
            that.managerRef.emit(["link", that.lastPort]);
            newProd.emit(["config", benchUtils_1.BenchConfig.prodConItems, benchUtils_1.BenchConfig.prodConProdCost, NodeProducerConsumerBench._MANAGER_PORT_]);
            that.producers.push(newProd);
            that.lastPort++;
            prodCount -= 1;
        }
        var conCount = benchUtils_1.BenchConfig.prodConCon;
        while (conCount > 0) {
            var newCon = that.spawnNode("Producer-Consumer/ProducerConsumerConsumer", sysHandler, that.lastPort);
            newCon.emit(["config", benchUtils_1.BenchConfig.prodConProdCost, NodeProducerConsumerBench._MANAGER_PORT_]);
            that.managerRef.emit(["registerConsumer", that.lastPort]);
            that.lastPort++;
            conCount -= 1;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.producers = [];
    }
}
NodeProducerConsumerBench._MANAGER_PORT_ = 8001;
exports.NodeProducerConsumerBench = NodeProducerConsumerBench;
//# sourceMappingURL=ProducerConsumerMain.js.map