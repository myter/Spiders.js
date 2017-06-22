Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
class NodeCigaretteSmokersBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Cigarette Smokers", "Node Cigarette Smokers cycle completed", "Node Cigarette Smokers completed", "Node Cigarette Smokers scheduled");
        this.lastPort = 8002;
        this.smokers = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.cigSmokeSmokers + 1) {
                    that.arbiterRef.emit(["pickRandom"]);
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
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.arbiterRef = that.spawnNode("Cigarette-Smokers/CigaretteSmokersArbiter", sysHandle, NodeCigaretteSmokersBench._ARBITER_PORT_);
        that.arbiterRef.emit(["config", benchUtils_1.BenchConfig.cigSmokeRounds, benchUtils_1.BenchConfig.cigSmokeSmokers]);
        var smokCount = benchUtils_1.BenchConfig.cigSmokeSmokers - 1;
        while (smokCount >= 0) {
            var newSmok = that.spawnNode("Cigarette-Smokers/CigaretteSmokersSmoker", sysHandle, that.lastPort);
            newSmok.emit(["config", NodeCigaretteSmokersBench._ARBITER_PORT_]);
            that.arbiterRef.emit(["newSmoker", that.lastPort]);
            that.smokers.push(newSmok);
            that.lastPort++;
            smokCount -= 1;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.smokers = [];
    }
}
NodeCigaretteSmokersBench._ARBITER_PORT_ = 8001;
exports.NodeCigaretteSmokersBench = NodeCigaretteSmokersBench;
//# sourceMappingURL=CigaretteSmokersMain.js.map