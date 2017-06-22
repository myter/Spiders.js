Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var numWorkers = null;
var workers = [];
var numWorkersTerminated = 0;
var numWorkSent = 0;
var grid = null;
var gridSize = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    //Graph stuff
    function makeNode(id, i, j, k, neighbors) {
        return [id, i, j, k, neighbors, id == 0 ? 0 : -1, null];
    }
    function getId(node) {
        return node[0];
    }
    function getI(node) {
        return node[1];
    }
    function getJ(node) {
        return node[2];
    }
    function getK(node) {
        return node[3];
    }
    function setParentInPath(node, newParent) {
        node[6] = newParent;
    }
    function addNeighbor(node, newNeighbor) {
        var currentNeighbours = node[4];
        if (getId(newNeighbor) == getId(node)) {
            return false;
        }
        else {
            var alreadyIn = false;
            for (var i in currentNeighbours) {
                if (getId(currentNeighbours[i]) == getId(newNeighbor)) {
                    alreadyIn = true;
                }
            }
            if (!alreadyIn) {
                currentNeighbours.push(newNeighbor);
            }
            return (!alreadyIn);
        }
    }
    function randBool() {
        var val = Math.floor(Math.random() * (2 - 0) + 0);
        if (val == 0) {
            return false;
        }
        else {
            return true;
        }
    }
    function generateData() {
        var allNodes = {};
        var id = 0;
        for (var i1 = 0; i1 < gridSize; i1++) {
            for (var j1 = 0; j1 < gridSize; j1++) {
                for (var k1 = 0; k1 < gridSize; k1++) {
                    var node = makeNode(id, i1, j1, k1, []);
                    allNodes[id] = node;
                    id++;
                }
            }
        }
        for (var a in allNodes) {
            var gridNode = allNodes[a];
            var iterCount = 0;
            var neighborCount = 0;
            for (var i = 0; i < 2; i++) {
                for (var j = 0; j < 2; j++) {
                    for (var k = 0; k < 2; k++) {
                        iterCount++;
                        if (iterCount != 1 && iterCount != 8) {
                            var b = (iterCount == 7 && neighborCount == 0) || randBool();
                            if (b) {
                                var newI = Math.min(gridSize - 1, getI(gridNode) + i);
                                var newJ = Math.min(gridSize - 1, getJ(gridNode) + j);
                                var newK = Math.min(gridSize - 1, getK(gridNode) + k);
                                var newId = (gridSize * gridSize * newI) + (gridSize * newJ) + newK;
                                var newNode = allNodes[newId];
                                if (addNeighbor(gridNode, newNode)) {
                                    neighborCount++;
                                }
                            }
                        }
                    }
                }
            }
        }
        return allNodes;
    }
    function config(nw, gs) {
        numWorkers = nw;
        gridSize = gs;
        grid = generateData();
    }
    function addWorker(id, workerPort) {
        var workerRef = new benchUtils_1.ClientBufferSocket(workerPort, mHandle);
        workers[id] = workerRef;
    }
    function configDone() {
        socketToMain.emit(["actorInit"]);
    }
    function start() {
        var origin = grid[0];
        var axisVal = 0.80 * gridSize;
        var targetId = (axisVal * gridSize * gridSize) + (axisVal * gridSize) + axisVal;
        var targetNode = grid[targetId];
        sendWork(origin, targetNode);
    }
    function sendWork(origin, target) {
        var workerIndex = numWorkSent % numWorkers;
        numWorkSent += 1;
        workers[workerIndex].emit(["work", origin, target]);
    }
    function updateNodeParent(nodeId, newParent) {
        var node = grid[nodeId];
        setParentInPath(node, newParent);
    }
    function done() {
        for (var i in workers) {
            workers[i].emit(["stop"]);
        }
    }
    function stop() {
        numWorkersTerminated += 1;
        if (numWorkersTerminated == numWorkers) {
            socketToMain.emit(["end"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
            break;
        case "addWorker":
            addWorker(data[1], data[2]);
            break;
        case "configDone":
            configDone();
            break;
        case "start":
            start();
            break;
        case "sendWork":
            sendWork(data[1], data[2]);
            break;
        case "updateNodeParent":
            updateNodeParent(data[1], data[2]);
            break;
        case "done":
            done();
            break;
        case "stop":
            stop();
            break;
        default:
            console.log("Unknown message (Master): " + data[0]);
    }
}
//# sourceMappingURL=AStarSearchMaster.js.map