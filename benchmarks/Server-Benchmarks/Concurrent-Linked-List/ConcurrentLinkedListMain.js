Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
class NodeConcurrentLinkedListBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Concurrent Linked List", "Node Concurrent Linked List cycle completed", "Node Concurrent Linked List completed", "Node Concurrent Linked List scheduled");
        this.lastPort = 8003;
        this.actors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandler(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.cLinkedListActors + 2) {
                    for (var i in that.actors) {
                        that.actors[i].emit(["work"]);
                    }
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                default:
                    console.log("Unknown message: " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandler);
        that.masterRef = that.spawnNode("Concurrent-Linked-List/ConcurrentLinkedListMaster", sysHandler, NodeConcurrentLinkedListBench._MASTER_PORT_);
        that.masterRef.emit(["config", benchUtils_1.BenchConfig.cLinkedListActors]);
        that.listRef = that.spawnNode("Concurrent-Linked-List/ConcurrentLinkedListList", sysHandler, NodeConcurrentLinkedListBench._LIST_PORT_);
        var count = benchUtils_1.BenchConfig.cLinkedListActors;
        while (count > 0) {
            var newActor = that.spawnNode("Concurrent-Linked-List/ConcurrentLinkedListWorker", sysHandler, that.lastPort);
            that.actors.push(newActor);
            that.masterRef.emit(["link", that.lastPort]);
            that.listRef.emit(["link", that.lastPort]);
            newActor.emit(["linkMaster", NodeConcurrentLinkedListBench._MASTER_PORT_]);
            newActor.emit(["linkList", NodeConcurrentLinkedListBench._LIST_PORT_]);
            newActor.emit(["config", benchUtils_1.BenchConfig.cLinkedListWrites, benchUtils_1.BenchConfig.cLinkedListSize, benchUtils_1.BenchConfig.cLinkedListMsgs]);
            that.lastPort++;
            count -= 1;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.actors = [];
    }
}
NodeConcurrentLinkedListBench._MASTER_PORT_ = 8001;
NodeConcurrentLinkedListBench._LIST_PORT_ = 8002;
exports.NodeConcurrentLinkedListBench = NodeConcurrentLinkedListBench;
//# sourceMappingURL=ConcurrentLinkedListMain.js.map