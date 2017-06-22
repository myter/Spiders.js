Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
class NodeChameneoBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Chameneo", "Node Chameneo cycle completed", "Node Chameneo completed", "Node Chameneo scheduled");
        this.lastPort = 8001;
        this.actors = new Map();
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var meetingsToHold = benchUtils_1.BenchConfig.chameneoMeetings;
        var numFaded = 0;
        var sumMeetings = 0;
        var waitingCham = null;
        var that = this;
        function sysHandler(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.chameneoActors) {
                    that.actors.forEach((actorSocket) => {
                        actorSocket.emit(["startGame"]);
                    });
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function meetCount(count) {
                numFaded += 1;
                sumMeetings = sumMeetings + count;
                if (numFaded == benchUtils_1.BenchConfig.chameneoActors) {
                    that.stopPromise.resolve();
                }
            }
            function meet(color, senderPort) {
                var senderSocket = that.actors.get(senderPort);
                if (meetingsToHold > 0) {
                    if (waitingCham == null) {
                        waitingCham = senderSocket;
                    }
                    else {
                        meetingsToHold -= 1;
                        waitingCham.emit(["meet", color, senderPort]);
                        waitingCham = null;
                    }
                }
                else {
                    senderSocket.emit(["exitGame"]);
                }
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "meetCount":
                    meetCount(data[1]);
                    break;
                case "meet":
                    meet(data[1], data[2]);
                    break;
                default:
                    console.log("Unknown message: " + data[0]);
            }
        }
        this.mainPort = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandler);
        var count = benchUtils_1.BenchConfig.chameneoActors;
        while (count > 0) {
            var newActor = this.spawnNode('Chameneos/ChameneoActor', sysHandler, this.lastPort);
            that.actors.set(this.lastPort, newActor);
            this.lastPort++;
            count -= 1;
        }
        var neighBourIndex = 0;
        that.actors.forEach((socket) => {
            socket.emit(["config", (neighBourIndex % 3)]);
            neighBourIndex++;
        });
    }
    cleanUp() {
        this.cleanNodes();
        this.mainPort.close();
        this.actors = new Map();
    }
}
exports.NodeChameneoBench = NodeChameneoBench;
//# sourceMappingURL=ChameneoMain.js.map