Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var sinkRef = null;
var sum = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(sinkPort) {
        sinkRef = new benchUtils_1.ClientBufferSocket(sinkPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    function newVal(val) {
        sum += val;
    }
    function valEnd() {
        sinkRef.emit(["valueMessage", sum]);
        sum = 0;
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "link":
            link(data[1]);
            break;
        case "newVal":
            newVal(data[1]);
            break;
        case "valEnd":
            valEnd();
            break;
        default:
            console.log("Unknown message (Combine): " + data[0]);
    }
}
//# sourceMappingURL=FilterBankCombine.js.map