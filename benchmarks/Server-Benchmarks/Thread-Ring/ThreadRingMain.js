Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 07/02/2017.
 */
class NodeThreadRingBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Thread Ring", "Node Thread Ring cycle completed", "Node Thread Ring completed", "Node Thread Ring scheduled");
        this.lastPort = 8001;
        this.actors = [];
        this.ports = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandler(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.threadRingActors) {
                    that.actors[0].emit(["ping", benchUtils_1.BenchConfig.threadRingPings]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function traversalDone() {
                that.stopPromise.resolve();
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "traversalDone":
                    traversalDone();
                    break;
            }
        }
        this.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandler);
        var count = benchUtils_1.BenchConfig.threadRingActors;
        while (count > 0) {
            var newActor = this.spawnNode('Thread-Ring/ThreadRingActor', sysHandler, this.lastPort);
            this.ports.push(this.lastPort);
            this.actors.push(newActor);
            this.lastPort++;
            count -= 1;
        }
        var index = 0;
        for (var i in this.actors) {
            var next = this.actors[i];
            var port = this.ports[i];
            var neighbour = (index + 1) % benchUtils_1.BenchConfig.threadRingActors;
            next.emit(["neighbour", benchUtils_1.BenchConfig.threadRingActors, this.ports[neighbour]]);
            this.actors[neighbour].emit(["newLink", port]);
            index += 1;
        }
    }
    cleanUp() {
        this.cleanNodes;
        this.actors = [];
        this.ports = [];
        this.mainSocket.close();
    }
}
exports.NodeThreadRingBench = NodeThreadRingBench;
//# sourceMappingURL=ThreadRingMain.js.map