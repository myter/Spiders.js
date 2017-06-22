Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 07/02/2017.
 */
class NodeFJCreationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Fork-join creation", "Node Fork-join creation cycle completed", "Node Fork-join creation completed", "Node Fork-join scheduled");
        this.lastPort = 8001;
        this.actors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var actorsDone = 0;
        var that = this;
        function sysHandler(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.fjCreationActors) {
                    actorsDone = 0;
                    for (var i in that.actors) {
                        that.actors[i].emit(["newMessage"]);
                    }
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function actorDone() {
                actorsDone += 1;
                if (actorsDone == benchUtils_1.BenchConfig.fjCreationActors) {
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
        var count = benchUtils_1.BenchConfig.fjCreationActors;
        while (count > 0) {
            var newActor = this.spawnNode('Fork-Join-Creation/FJCreationActor', sysHandler, this.lastPort);
            this.actors.push(newActor);
            this.lastPort++;
            count -= 1;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.actors = [];
        this.mainSocket.close();
    }
}
exports.NodeFJCreationBench = NodeFJCreationBench;
//# sourceMappingURL=FJCreationMain.js.map