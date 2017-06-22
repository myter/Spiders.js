Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var waiterRef = null;
var id = null;
var totalRounds = null;
var doneRounds = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(i, tr, waiterPort) {
        id = i;
        totalRounds = tr;
        waiterRef = new benchUtils_1.ClientBufferSocket(waiterPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function start() {
        waiterRef.emit(["hungry", id, myPort]);
    }
    function denied() {
        waiterRef.emit(["hungry", id, myPort]);
    }
    function eating() {
        doneRounds += 1;
        waiterRef.emit(["done", id]);
        if (doneRounds == totalRounds) {
            waiterRef.emit(["philExit"]);
        }
        else {
            waiterRef.emit(["hungry", id, myPort]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3]);
            break;
        case "start":
            start();
            break;
        case "denied":
            denied();
            break;
        case "eating":
            eating();
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=DiningPhilosopherPhilosopher.js.map