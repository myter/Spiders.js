Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
const CountMain_1 = require("./CountMain");
/**
 * Created by flo on 07/02/2017.
 */
var totalCount = null;
var countsLeft = null;
var countRef = null;
new benchUtils_1.ServerBufferSocket(CountMain_1.NodeCountBench._PROD_WORKER_PORT_, produceHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, produceHandler);
function produceHandler(data) {
    function config(countNumber) {
        totalCount = countNumber;
        countsLeft = countNumber;
        countRef = new benchUtils_1.ClientBufferSocket(CountMain_1.NodeCountBench._COUNT_WORKER_PORT, produceHandler);
        socketToMain.emit(["prodInit"]);
    }
    function start() {
        countsLeft = totalCount;
        countRef.emit(["inc", true]);
        while (countsLeft > 0) {
            countRef.emit(["inc", false]);
            countsLeft -= 1;
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "start":
            start();
            break;
    }
}
//# sourceMappingURL=CountProducer.js.map