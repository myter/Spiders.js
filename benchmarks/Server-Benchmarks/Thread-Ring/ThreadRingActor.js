Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 07/02/2017.
 */
var allNeighbours = null;
var myNeighbour = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
function mHandler(data) {
    function ping(pingsLeft) {
        if (pingsLeft > 0) {
            pingsLeft = pingsLeft - 1;
            myNeighbour.emit(["ping", pingsLeft]);
        }
        else {
            myNeighbour.emit(["stop", allNeighbours]);
        }
    }
    function stop(stopsLeft) {
        if (stopsLeft > 0) {
            stopsLeft = stopsLeft - 1;
            myNeighbour.emit(["stop", stopsLeft]);
        }
        else {
            socketToMain.emit(["traversalDone"]);
        }
    }
    function neighbour(totalActors, neighbourPort) {
        myNeighbour = new benchUtils_1.ClientBufferSocket(neighbourPort, mHandler);
        allNeighbours = totalActors;
        socketToMain.emit(["actorInit"]);
    }
    function newLink(chanPort) {
        new benchUtils_1.ClientBufferSocket(chanPort, mHandler);
    }
    switch (data[0]) {
        case "ping":
            ping(data[1]);
            break;
        case "stop":
            stop(data[1]);
            break;
        case "neighbour":
            neighbour(data[1], data[2]);
        case "newLink":
            newLink(data[1]);
    }
}
//# sourceMappingURL=ThreadRingActor.js.map