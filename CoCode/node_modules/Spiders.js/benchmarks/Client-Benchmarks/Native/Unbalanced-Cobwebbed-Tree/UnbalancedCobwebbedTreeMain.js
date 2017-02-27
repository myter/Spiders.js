const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 26/01/2017.
 */
class NatUnbalancedCobwebbedTreeBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Unbalanced Cobwebbed Tree", "Native Unbalanced Cobwebbed Tree cycle completed", "Native Unbalanced Cobwebbed Tree completed", "Native Unbalanced Cobwebbed Tree scheduled");
        this.spawned = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var totalSpawned = 1;
        var totalEnded = 0;
        var nodeInfo = {};
        var that = this;
        function sysHandle(event) {
            function checkConfig() {
                if (actorsInitialised == 1) {
                    that.rootRef.postMessage(["generateTree"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            function spawnNodeP1(root, height, id, comp, urgent, partId) {
                nodeInfo[partId] = [root, height, id, comp, urgent];
            }
            function spawnNodeP2(partId, parent) {
                var c = new MessageChannel();
                parent.postMessage(["childSpawned"], [c.port1]);
                var root = nodeInfo[partId][0];
                var height = nodeInfo[partId][1];
                var id = nodeInfo[partId][2];
                var comp = nodeInfo[partId][3];
                var urgent = nodeInfo[partId][4];
                var nodeRef = that.spawnWorker(require('./UnbalancedCobwebbedTreeNode.js'));
                nodeRef.onmessage = sysHandle;
                that.spawned.push(nodeRef);
                nodeRef.onmessage = sysHandle;
                nodeRef.postMessage(["link"], [c.port2]);
                nodeRef.postMessage(["linkParent"], [parent]);
                nodeRef.postMessage(["config", height, id, comp, urgent, benchUtils_1.BenchConfig.uctBinomial], [root]);
                nodeRef.postMessage(["tryGenerate"]);
                totalSpawned += 1;
            }
            function endNode(id) {
                totalEnded += 1;
                if (totalEnded == totalSpawned) {
                    end();
                }
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                case "spawnNodeP1":
                    spawnNodeP1(event.ports[0], event.data[1], event.data[2], event.data[3], event.data[4], event.data[5]);
                    break;
                case "spawnNodeP2":
                    spawnNodeP2(event.data[1], event.ports[0]);
                    break;
                case "endNode":
                    endNode(event.data[1]);
                    break;
                default:
                    console.log("Unknown message (System): " + event.data[0]);
            }
        }
        that.rootRef = that.spawnWorker(require('./UnbalancedCobwebbedTreeRoot.js'));
        that.rootRef.onmessage = sysHandle;
        that.rootRef.postMessage(["config", benchUtils_1.BenchConfig.uctMaxNodes, benchUtils_1.BenchConfig.uctAvgCompSize, benchUtils_1.BenchConfig.uctStdevCompSize, benchUtils_1.BenchConfig.uctBinomial, benchUtils_1.BenchConfig.uctPercent]);
    }
    cleanUp() {
        this.spawned.push(this.rootRef);
        this.cleanWorkers(this.spawned);
        this.spawned = [];
    }
}
exports.NatUnbalancedCobwebbedTreeBench = NatUnbalancedCobwebbedTreeBench;
//# sourceMappingURL=UnbalancedCobwebbedTreeMain.js.map