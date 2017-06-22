Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var sourceId = null;
var nextRef = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(si, nextPort) {
        sourceId = si;
        nextRef = new benchUtils_1.ClientBufferSocket(nextPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    function valueMessage(val) {
        nextRef.emit(["sourceValueMessage", sourceId, val]);
    }
    function exit() {
        nextRef.emit(["exit"]);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
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
            console.log("Unknown message (Tagged Forward): " + data[0]);
    }
}
//# sourceMappingURL=FilterBankTaggedForward.js.map