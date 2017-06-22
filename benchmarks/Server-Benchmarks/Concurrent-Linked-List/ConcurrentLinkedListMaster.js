Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var totalWorkers = 0;
var workersDone = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
function mHandler(data) {
    function config(tw) {
        totalWorkers = tw;
        socketToMain.emit(["actorInit"]);
    }
    function workerDone() {
        workersDone += 1;
        if (workersDone == totalWorkers) {
            socketToMain.emit(["end"]);
        }
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandler);
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "workerDone":
            workerDone();
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=ConcurrentLinkedListMaster.js.map