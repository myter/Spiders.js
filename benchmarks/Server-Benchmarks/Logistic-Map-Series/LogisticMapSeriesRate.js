Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var rate = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
var knownRequesters = new Map();
function mHandle(data) {
    function config(r) {
        rate = r;
        socketToMain.emit(["actorInit"]);
    }
    function compute(term, requesterPort) {
        var res = rate * term * (1 - term);
        if (knownRequesters.has(requesterPort)) {
            var requester = knownRequesters.get(requesterPort);
        }
        else {
            var requester = new benchUtils_1.ClientBufferSocket(requesterPort, mHandle);
            knownRequesters.set(requesterPort, requester);
        }
        requester.emit(["termDone", res]);
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "compute":
            compute(data[1], data[2]);
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=LogisticMapSeriesRate.js.map