Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var left = null;
var right = null;
var precision = null;
var workers = [];
var termsReceived = 0;
var resultArea = 0.0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(l, r, p) {
        left = l;
        right = r;
        precision = p;
    }
    function newWorker(refPort) {
        var ref = new benchUtils_1.ClientBufferSocket(refPort, mHandle);
        workers.push(ref);
    }
    function configDone() {
        socketToMain.emit(["actorInit"]);
    }
    function work() {
        var workerRange = (right - left) / workers.length;
        var index = 0;
        for (var i in workers) {
            var wl = (workerRange * index) + left;
            var wr = wl + workerRange;
            workers[i].emit(["work", wl, wr, precision]);
            index += 1;
        }
    }
    function result(area, id) {
        termsReceived += 1;
        resultArea += area;
        if (termsReceived == workers.length) {
            socketToMain.emit(["actorExit"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3]);
            break;
        case "configDone":
            configDone();
            break;
        case "newWorker":
            newWorker(data[1]);
            break;
        case "work":
            work();
            break;
        case "result":
            result(data[1], data[2]);
            break;
        default:
            console.log("Unknown message (Master): " + data[0]);
    }
}
//# sourceMappingURL=TrapezoidalApproximationMaster.js.map