Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var dataSize = 0;
var radix = 0;
var nextRef = null;
var valueSoFar = 0;
var j = 0;
var ordering = [];
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(ds, r, nextPort) {
        dataSize = ds;
        radix = r;
        nextRef = new benchUtils_1.ClientBufferSocket(nextPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function value(candidate) {
        valueSoFar += 1;
        var current = candidate;
        if ((current & radix) == 0) {
            nextRef.emit(["value", candidate]);
        }
        else {
            ordering[j] = candidate;
            j += 1;
        }
        if (valueSoFar == dataSize) {
            var i = 0;
            while (i < j) {
                nextRef.emit(["value", ordering[i]]);
                i++;
            }
            socketToMain.emit(["actorExit"]);
        }
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3]);
            break;
        case "value":
            value(data[1]);
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=RadixSortSort.js.map