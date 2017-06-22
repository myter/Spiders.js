Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var sourceId = null;
var delayLength = null;
var nextRef = null;
var state = [];
var placeHolder = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(si, dl, nextPort) {
        sourceId = si;
        delayLength = dl;
        nextRef = new benchUtils_1.ClientBufferSocket(nextPort, mHandle);
        for (var i = 0; i < delayLength; i++) {
            state[i] = 0;
        }
        socketToMain.emit(["actorInit"]);
    }
    function link(ref) {
        ref.onmessage = mHandle;
    }
    function valueMessage(val) {
        nextRef.emit(["valueMessage", state[placeHolder]]);
        state[placeHolder] = val;
        placeHolder = (placeHolder + 1) % delayLength;
    }
    function exit() {
        nextRef.emit(["exit"]);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3]);
            break;
        case "link":
            link(data[1]);
            break;
        case "valueMessage":
            valueMessage(data[1]);
            break;
        case "exit":
            exit();
            break;
        default:
            console.log("Unknown message (Delay): " + data[0]);
    }
}
//# sourceMappingURL=FilterBankDelay.js.map