Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var arbiterRef = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
var linked = 0;
function mHandle(data) {
    function config(arbiterPort) {
        arbiterRef = new benchUtils_1.ClientBufferSocket(arbiterPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function busyWait(limit) {
        for (var i = 0; i < limit; i++) {
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }
    function startSmoking(time) {
        arbiterRef.emit(["startedSmoking"]);
        busyWait(time);
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "startSmoking":
            startSmoking(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=CigaretteSmokersSmoker.js.map