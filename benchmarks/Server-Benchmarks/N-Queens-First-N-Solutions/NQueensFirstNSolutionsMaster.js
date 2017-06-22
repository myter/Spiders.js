Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var solutions = null;
var priorities = null;
var numWorkers = null;
var workers = [];
var messageCounter = 0;
var numWorkersTerminated = 0;
var numWorkSent = 0;
var numWorkCompleted = 0;
var resultCounter = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(s, p, n) {
        solutions = s;
        priorities = p;
        numWorkers = n;
    }
    function addWorker(id, workerPort) {
        var workerRef = new benchUtils_1.ClientBufferSocket(workerPort, mHandle);
        workers[id] = workerRef;
    }
    function configDone() {
        socketToMain.emit(["actorInit"]);
    }
    function start() {
        sendWork(priorities, [], 0);
    }
    function sendWork(priority, data, depth) {
        workers[messageCounter].emit(["work", priority, data, depth]);
        messageCounter = (messageCounter + 1) % numWorkers;
        numWorkSent += 1;
    }
    function result() {
        resultCounter += 1;
        if (resultCounter >= solutions) {
            socketToMain.emit(["end"]);
        }
    }
    function done() {
        numWorkCompleted += 1;
        if (numWorkCompleted == numWorkSent) {
            socketToMain.emit(["end"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3]);
            break;
        case "addWorker":
            addWorker(data[1], data[2]);
            break;
        case "configDone":
            configDone();
            break;
        case "start":
            start();
            break;
        case "sendWork":
            sendWork(data[1], data[2], data[3]);
            break;
        case "result":
            result();
            break;
        case "done":
            done();
            break;
        default:
            console.log("Unknown message (Master): " + data[0]);
    }
}
//# sourceMappingURL=NQueensFirstNSolutionsMaster.js.map