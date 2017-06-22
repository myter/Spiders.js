Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var dataSize = 0;
var maxValue = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(ds, mv) {
        dataSize = ds;
        maxValue = mv;
        socketToMain.emit(["actorInit"]);
    }
    function getRandom(upper) {
        return Math.floor(Math.random() * (upper - 0) + 0);
    }
    function nextActor(nextPort) {
        var i = 0;
        while (i < dataSize) {
            var candidate = getRandom(100000) % maxValue;
            var next = new benchUtils_1.ClientBufferSocket(nextPort, mHandle);
            next.emit(["value", candidate]);
            i++;
        }
        socketToMain.emit(["actorExit"]);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
            break;
        case "nextActor":
            nextActor(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=RadixSortSource.js.map