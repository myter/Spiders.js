const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 26/01/2017.
 */
class NatAllPairShortestPathBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native All Pair Shortest Path", "Native All Pair Shortest Path cycle completed", "Native All Pair Shortest Path completed", "Native All Pair Shortest Path scheduled");
        this.allActors = [];
        this.blockActors = {};
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var actorsExited = 0;
        var that = this;
        function sysHandle(event) {
            function checkConfig() {
                if (actorsInitialised == numBlocksInSingleDim * numBlocksInSingleDim) {
                    for (var bi = 0; bi < numBlocksInSingleDim; bi++) {
                        for (var bj = 0; bj < numBlocksInSingleDim; bj++) {
                            that.blockActors[bi][bj].postMessage(["start"]);
                        }
                    }
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function actorExit() {
                actorsExited += 1;
                if (actorsExited == numBlocksInSingleDim * numBlocksInSingleDim) {
                    that.stopPromise.resolve();
                }
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "actorExit":
                    actorExit();
                    break;
                default:
                    console.log("Unknown message (System): " + event.data[0]);
            }
        }
        var numNodes = benchUtils_1.BenchConfig.apspN;
        var blockSize = benchUtils_1.BenchConfig.apspB;
        var numBlocksInSingleDim = Math.floor(numNodes / blockSize);
        for (var i = 0; i < numBlocksInSingleDim; i++) {
            that.blockActors[i] = {};
            for (var j = 0; j < numBlocksInSingleDim; j++) {
                var myBlockId = (i * numBlocksInSingleDim) + j;
                var workerRef = that.spawnWorker(require('./AllPairShortestPathWorker.js'));
                that.allActors.push(workerRef);
                workerRef.onmessage = sysHandle;
                workerRef.postMessage(["config", myBlockId, blockSize, numNodes, benchUtils_1.BenchConfig.apspW]);
                that.blockActors[i][j] = workerRef;
            }
        }
        for (var bi = 0; bi < numBlocksInSingleDim; bi++) {
            for (var bj = 0; bj < numBlocksInSingleDim; bj++) {
                var neighbours = [];
                for (var r = 0; r < numBlocksInSingleDim; r++) {
                    if (r != bi) {
                        neighbours.push(that.blockActors[r][bj]);
                    }
                }
                for (var c = 0; c < numBlocksInSingleDim; c++) {
                    if (c != bj) {
                        neighbours.push(that.blockActors[bi][c]);
                    }
                }
                var current = that.blockActors[bi][bj];
                for (var k in neighbours) {
                    var chan = new MessageChannel();
                    current.postMessage(["newNeighbour"], [chan.port2]);
                    neighbours[k].postMessage(["link"], [chan.port1]);
                }
            }
        }
        for (var bi = 0; bi < numBlocksInSingleDim; bi++) {
            for (var bj = 0; bj < numBlocksInSingleDim; bj++) {
                that.blockActors[bi][bj].postMessage(["configDone"]);
            }
        }
    }
    cleanUp() {
        this.cleanWorkers(this.allActors);
        this.allActors = [];
        this.blockActors = {};
    }
}
exports.NatAllPairShortestPathBench = NatAllPairShortestPathBench;
//# sourceMappingURL=AllPairShortestPathMain.js.map