Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var limit = null;
var filterRef = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(l, filterPort) {
        limit = l;
        filterRef = new benchUtils_1.ClientBufferSocket(filterPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function start() {
        var candidate = 3;
        while (candidate < limit) {
            filterRef.emit(["longBox", candidate]);
            candidate += 2;
        }
        filterRef.emit(["stop"]);
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
            break;
        case "start":
            start();
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message (Number Producer): " + data[0]);
    }
}
//# sourceMappingURL=SieveOfEratosthenesProducer.js.map