Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 07/02/2017.
 */
class NodeFJThroughputBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Fork-join throughput", "Node Fork-join cycle completed", "Node Fork-join completed", "Node Fork-join scheduled");
        this.lastPort = 8001;
        this.actors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var actorsDone = 0;
        var that = this;
        function sysHandler(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.fjThroughputActors) {
                    actorsDone = 0;
                    for (var i in that.actors) {
                        that.actors[i].emit(["newMessage", true]);
                    }
                    for (var i in that.actors) {
                        var next = that.actors[i];
                        for (var j = 0; j < benchUtils_1.BenchConfig.fjThroughputMessages; j++) {
                            next.emit(["newMessage", false]);
                        }
                    }
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function actorDone() {
                actorsDone += 1;
                if (actorsDone == benchUtils_1.BenchConfig.fjThroughputActors) {
                    that.stopPromise.resolve();
                }
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "actorDone":
                    actorDone();
                    break;
            }
        }
        this.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandler);
        var count = benchUtils_1.BenchConfig.fjThroughputActors;
        while (count > 0) {
            var newActor = this.spawnNode("Fork-Join-Throughput/FJThroughputActor", sysHandler, this.lastPort);
            that.actors.push(newActor);
            newActor.emit(["config", benchUtils_1.BenchConfig.fjThroughputMessages]);
            this.lastPort += 1;
            count -= 1;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.actors = [];
        this.mainSocket.close();
    }
}
exports.NodeFJThroughputBench = NodeFJThroughputBench;
//# sourceMappingURL=FJThroughputMain.js.map