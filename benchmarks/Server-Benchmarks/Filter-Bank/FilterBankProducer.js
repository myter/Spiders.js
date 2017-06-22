Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var sourceRef = null;
var totalSimulations = null;
var messagesSent = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(ts, sourcePort) {
        totalSimulations = ts;
        sourceRef = new benchUtils_1.ClientBufferSocket(sourcePort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function nextMessage() {
        if (messagesSent == totalSimulations) {
            sourceRef.emit(["exit"]);
        }
        else {
            sourceRef.emit(["boot"]);
            messagesSent += 1;
        }
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
            break;
        case "nextMessage":
            nextMessage();
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message (Producer): " + data[0]);
    }
}
//# sourceMappingURL=FilterBankProducer.js.map