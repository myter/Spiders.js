Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
const CountMain_1 = require("./CountMain");
/**
 * Created by flo on 07/02/2017.
 */
var totalCount = null;
var countSoFar = null;
new benchUtils_1.ServerBufferSocket(CountMain_1.NodeCountBench._COUNT_WORKER_PORT, countHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, countHandler);
function countHandler(data) {
    function config(countNumber) {
        totalCount = countNumber;
        countSoFar = 0;
        new benchUtils_1.ClientBufferSocket(CountMain_1.NodeCountBench._PROD_WORKER_PORT_, countHandler);
        socketToMain.emit(["countInit"]);
    }
    function inc(fresh) {
        if (fresh) {
            countSoFar = 0;
        }
        else {
            countSoFar += 1;
            if (countSoFar == totalCount) {
                socketToMain.emit(["countsExhausted"]);
            }
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "inc":
            inc(data[1]);
            break;
    }
}
//# sourceMappingURL=CountCounter.js.map