Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var dataSize = 0;
var sumSoFar = 0;
var valueSoFar = 0;
var prevValue = 0;
var errorValue1 = -1;
var errorValue2 = -1;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(ds) {
        dataSize = ds;
        socketToMain.emit(["actorInit"]);
    }
    function value(candidate) {
        valueSoFar += 1;
        if (candidate < prevValue && errorValue1 < 0) {
            errorValue2 = candidate;
            errorValue1 = valueSoFar - 1;
        }
        prevValue = candidate;
        sumSoFar += prevValue;
        if (valueSoFar == dataSize) {
            socketToMain.emit(["actorExit"]);
        }
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
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
//# sourceMappingURL=RadixSortValidation.js.map