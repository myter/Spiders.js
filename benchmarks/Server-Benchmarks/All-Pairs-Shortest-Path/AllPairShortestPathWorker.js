Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var myBlockId = null;
var blockSize = null;
var numNodes = null;
var W = null;
var neighbours = [];
var graphData = null;
var numBlocksInSingleDim = null;
var numNeighbors = null;
var rowOffset = null;
var colOffset = null;
var k = -1;
var neighborDataPerIteration = {};
var currentIterData = null;
var dataCollected = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(mbi, bs, nn, wc) {
        myBlockId = mbi;
        blockSize = bs;
        numNodes = nn;
        W = wc;
        var localData = {};
        for (var i = 0; i < numNodes; i++) {
            localData[i] = {};
            for (var j = 0; j < numNodes; j++) {
                if (!(j in localData)) {
                    localData[j] = {};
                }
                localData[i][j] = 0;
                localData[j][i] = 0;
            }
        }
        for (var i = 0; i < numNodes; i++) {
            for (var j = i + 1; j < numNodes; j++) {
                var r = Math.floor(Math.random() * (W - 0) + 0);
                localData[i][j] = r;
                localData[j][i] = r;
            }
        }
        graphData = localData;
        numBlocksInSingleDim = Math.floor(numNodes / blockSize);
        numNeighbors = 2 * (numBlocksInSingleDim - 1);
        rowOffset = (Math.floor(myBlockId / numBlocksInSingleDim)) * blockSize;
        colOffset = (myBlockId % numBlocksInSingleDim) * blockSize;
        currentIterData = getBlock(graphData, myBlockId);
    }
    function newNeighbour(neighbourPort) {
        var neighbourRef = new benchUtils_1.ClientBufferSocket(neighbourPort, mHandle);
        neighbours.push(neighbourRef);
    }
    function configDone() {
        socketToMain.emit(["actorInit"]);
    }
    function getBlock(data, id) {
        var localData = {};
        for (var i = 0; i < blockSize; i++) {
            localData[i] = {};
            for (var j = 0; j < blockSize; j++) {
                if (!(j in localData)) {
                    localData[j] = {};
                }
                localData[i][j] = 0;
                localData[j][i] = 0;
            }
        }
        var numBlocksPerDim = Math.floor(numNodes / blockSize);
        var globalStartRow = (Math.floor(id / numBlocksPerDim)) * blockSize;
        var globalStartCol = (id % numBlocksPerDim) * blockSize;
        for (var i = 0; i < blockSize; i++) {
            for (var j = 0; j < blockSize; j++) {
                var point = data[i + globalStartRow][j + globalStartCol];
                localData[i][j] = point;
            }
        }
        return localData;
    }
    function notifyNeighbours() {
        for (var i in neighbours) {
            for (var j in currentIterData) {
                var row = currentIterData[j];
                for (var z in row) {
                    neighbours[i].emit(["storeIterationData", k, myBlockId, j, z, row[z]]);
                }
            }
            neighbours[i].emit(["resultsDone"]);
        }
    }
    function storeIterationData(k, id, colId, rowId, dataPoint) {
        if (!(id in neighborDataPerIteration)) {
            neighborDataPerIteration[id] = {};
        }
        if (!(colId in neighborDataPerIteration[id])) {
            neighborDataPerIteration[id][colId] = {};
        }
        neighborDataPerIteration[id][colId][rowId] = dataPoint;
    }
    function elementAt(row, col, srcIter, prevIterData) {
        var destBlockId = ((Math.floor(row / blockSize)) * numBlocksInSingleDim) + (Math.floor(col / blockSize));
        var localRow = row % blockSize;
        var localCol = col % blockSize;
        if (destBlockId == myBlockId) {
            return prevIterData[localRow][localCol];
        }
        else {
            var blockData = neighborDataPerIteration[destBlockId];
            //Application seems to be wrong sometime (literal translation of original benchmark), quick patch has no effect on performance or computation
            if (typeof blockData == 'undefined' || typeof blockData[localRow] == 'undefined') {
                return 0;
            }
            else {
                return blockData[localRow][localCol];
            }
        }
    }
    function performComputation() {
        var prevIterData = currentIterData;
        currentIterData = {};
        for (var i = 0; i < blockSize; i++) {
            currentIterData[i] = {};
            for (var j = 0; j < blockSize; j++) {
                if (!(j in currentIterData)) {
                    currentIterData[j] = {};
                }
                currentIterData[i][j] = 0;
                currentIterData[j][i] = 0;
            }
        }
        for (var i = 0; i < blockSize; i++) {
            for (var j = 0; j < blockSize; j++) {
                var gi = rowOffset + i;
                var gj = colOffset + j;
                var newIterData = elementAt(gi, k, k - 1, prevIterData) + elementAt(k, gj, k - 1, prevIterData);
                var newElement = Math.min(prevIterData[i][j], newIterData);
                currentIterData[i][j] = newElement;
            }
        }
    }
    function start() {
        notifyNeighbours();
    }
    function resultsDone() {
        dataCollected += 1;
        if (dataCollected == numNeighbors) {
            k += 1;
            performComputation();
            notifyNeighbours();
            neighborDataPerIteration = {};
            dataCollected = 0;
            if (k == (numNodes - 1)) {
                socketToMain.emit(["actorExit"]);
            }
        }
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3], data[4]);
            break;
        case "newNeighbour":
            newNeighbour(data[1]);
            break;
        case "configDone":
            configDone();
            break;
        case "storeIterationData":
            storeIterationData(data[1], data[2], data[3], data[4], data[5]);
            break;
        case "start":
            start();
            break;
        case "resultsDone":
            resultsDone();
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message (Worker): " + data[0]);
    }
}
//# sourceMappingURL=AllPairShortestPathWorker.js.map