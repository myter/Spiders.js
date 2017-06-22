Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var numWorkers = null;
var dataLength = null;
var workers = [];
var numWorkersTerminated = 0;
var numWorkSent = 0;
var numWorkCompleted = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(nw, dl) {
        numWorkers = nw;
        dataLength = dl;
    }
    function newWorker(id, workerPort) {
        var workerRef = new benchUtils_1.ClientBufferSocket(workerPort, mHandle);
        workers[id] = workerRef;
    }
    function configDone() {
        socketToMain.emit(["actorInit"]);
    }
    function start() {
        var numBlocks = dataLength * dataLength;
        sendWork(0, 0, 0, 0, 0, 0, 0, numBlocks, dataLength);
    }
    function sendWork(priority, srA, scA, srB, scB, srC, scC, numBlocks, dim) {
        var workerIndex = (srC + scC) % numWorkers;
        workers[workerIndex].emit(["work", priority, srA, scA, srB, scB, srC, scC, numBlocks, dim]);
        numWorkSent += 1;
    }
    function done() {
        numWorkCompleted += 1;
        if (numWorkCompleted == numWorkSent) {
            for (var i in workers) {
                workers[i].emit(["stop"]);
            }
        }
    }
    function stop() {
        numWorkersTerminated += 1;
        if (numWorkersTerminated == numWorkers) {
            socketToMain.emit(["end"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
            break;
        case "newWorker":
            newWorker(data[1], data[2]);
            break;
        case "configDone":
            configDone();
            break;
        case "start":
            start();
            break;
        case "sendWork":
            sendWork(data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9]);
            break;
        case "done":
            done();
            break;
        case "stop":
            stop();
            break;
        default:
            console.log("Unknown message (Master): " + data[0]);
    }
}
//# sourceMappingURL=RecursiveMatrixMultiplicationMaster.js.map