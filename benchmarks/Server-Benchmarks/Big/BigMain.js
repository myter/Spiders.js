Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
class NodeBigBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Big", "Node Big cycle completed", "Node Big completed", "Node Big scheduled");
        this.lastPort = 8002;
        this.actors = new Map();
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandler(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.bigActors + 1) {
                    that.actors.forEach((actorSocket) => {
                        actorSocket.emit(["pong"]);
                    });
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
        that.mainPort = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandler);
        that.sinkRef = this.spawnNode("Big/BigSink", sysHandler, NodeBigBench._SINK_PORT_);
        var count = benchUtils_1.BenchConfig.bigActors;
        while (count > 0) {
            var newActor = this.spawnNode("Big/BigActor", sysHandler, that.lastPort);
            that.actors.set(that.lastPort, newActor);
            that.lastPort++;
            count -= 1;
        }
        that.actors.forEach((current, currentPort) => {
            current.emit(["setSink"]);
            that.sinkRef.emit(["neighbour", benchUtils_1.BenchConfig.bigActors, currentPort]);
            that.actors.forEach((next, nextPort) => {
                if (nextPort != currentPort) {
                    current.emit(["neighbour", benchUtils_1.BenchConfig.bigActors, benchUtils_1.BenchConfig.bigPings, nextPort]);
                    next.emit(["link", currentPort]);
                }
            });
        });
    }
    cleanUp() {
        this.cleanNodes();
        this.mainPort.close();
        this.actors = new Map();
    }
}
NodeBigBench._SINK_PORT_ = 8001;
exports.NodeBigBench = NodeBigBench;
//# sourceMappingURL=BigMain.js.map