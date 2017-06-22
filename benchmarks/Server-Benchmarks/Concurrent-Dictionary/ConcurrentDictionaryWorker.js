Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var masterRef = null;
var dictRef = null;
var writePercentage = 0;
var totalMsgs = 0;
var currentMsgs = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
function mHandler(data) {
    function config(wp, t) {
        writePercentage = wp;
        totalMsgs = t;
        socketToMain.emit(["actorInit"]);
    }
    function linkMaster(masterPort) {
        masterRef = new benchUtils_1.ClientBufferSocket(masterPort, mHandler);
    }
    function linkDict(dictPort) {
        dictRef = new benchUtils_1.ClientBufferSocket(dictPort, mHandler);
    }
    function getRandom() {
        return Math.floor(Math.random() * (100 - 0 + 1)) + 0;
    }
    function work() {
        currentMsgs += 1;
        if (currentMsgs <= totalMsgs) {
            var rand = getRandom();
            if (rand < writePercentage) {
                var key = getRandom();
                var val = getRandom();
                dictRef.emit(["write", key, val, myPort]);
            }
            else {
                var key = getRandom();
                dictRef.emit(["read", key, myPort]);
            }
        }
        else {
            masterRef.emit(["workerDone"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
            break;
        case "work":
            work();
            break;
        case "linkMaster":
            linkMaster(data[1]);
            break;
        case "linkDict":
            linkDict(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=ConcurrentDictionaryWorker.js.map