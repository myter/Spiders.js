Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var producerRef = null;
var branchesRef = null;
var maxValue = 1000;
var current = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function linkProducer(producerPort) {
        producerRef = new benchUtils_1.ClientBufferSocket(producerPort, mHandle);
    }
    function linkBranches(branchesPort) {
        branchesRef = new benchUtils_1.ClientBufferSocket(branchesPort, mHandle);
    }
    function configDone() {
        socketToMain.emit(["actorInit"]);
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    function boot() {
        branchesRef.emit(["valueMessage", current]);
        current = (current + 1) % maxValue;
        producerRef.emit(["nextMessage"]);
    }
    function exit() {
        branchesRef.emit(["exit"]);
    }
    switch (data[0]) {
        case "linkProducer":
            linkProducer(data[1]);
            break;
        case "linkBranches":
            linkBranches(data[1]);
            break;
        case "link":
            link(data[1]);
            break;
        case "configDone":
            configDone();
            break;
        case "boot":
            boot();
            break;
        case "exit":
            exit();
            break;
        default:
            console.log("Unknown message (Source): " + data[0]);
    }
}
//# sourceMappingURL=FilterBankSource.js.map