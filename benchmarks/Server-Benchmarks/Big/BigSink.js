Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var totalNeighbours = 0;
var neighbours = [];
var exited = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
function mHandler(data) {
    function neighbour(totalAmount, neighbourPort) {
        totalNeighbours = totalAmount;
        var neighbourSocket = new benchUtils_1.ClientBufferSocket(neighbourPort, mHandler);
        neighbours.push(neighbourSocket);
        if (neighbours.length == totalAmount) {
            socketToMain.emit(["actorInit"]);
        }
    }
    function exit() {
        exited += 1;
        if (exited == totalNeighbours) {
            socketToMain.emit(["end"]);
        }
    }
    switch (data[0]) {
        case "neighbour":
            neighbour(data[1], data[2]);
            break;
        case "exit":
            exit();
            break;
        default:
            console.log("Unknown message in sink: " + data[0]);
    }
}
//# sourceMappingURL=BigSink.js.map