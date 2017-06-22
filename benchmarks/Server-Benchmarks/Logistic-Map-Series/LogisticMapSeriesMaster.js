Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var totalTerms = 0;
var workRequested = 0;
var workReceived = 0;
var workers = [];
var termsSum = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function newWorker(tw, tt, workerPort) {
        totalTerms = tt;
        var worker = new benchUtils_1.ClientBufferSocket(workerPort, mHandle);
        workers.push(worker);
        if (workers.length == tw) {
            socketToMain.emit(["actorInit"]);
        }
    }
    function start() {
        var i = 0;
        while (i < totalTerms) {
            for (var j in workers) {
                workers[j].emit(["nextTerm"]);
                workRequested += 1;
            }
            i++;
        }
    }
    function result(term) {
        termsSum += term;
        workReceived += 1;
        if (workRequested == workReceived) {
            socketToMain.emit(["end"]);
        }
    }
    switch (data[0]) {
        case "newWorker":
            newWorker(data[1], data[2], data[3]);
            break;
        case "start":
            start();
            break;
        case "result":
            result(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=LogisticMapSeriesMaster.js.map