Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../benchUtils");
/**
 * Created by flo on 20/02/2017.
 */
class ChildProcessMonteCarloBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Child Process Monte Carlo", "Child Process Monte Carlo cycle completed", "Child Process Monte Carlo completed", "Child Process Monte Carlo scheduled");
        this.lastPort = 8001;
    }
    runBenchmark() {
        var resultsReceived = 0;
        var that = this;
        //The only even received is the "result" event
        function messageHandler(event) {
            resultsReceived += 1;
            if (resultsReceived == benchUtils_1.BenchConfig.monteCarloWorkers) {
                that.stopPromise.resolve();
            }
        }
        this.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, messageHandler);
        for (var i = 0; i < benchUtils_1.BenchConfig.monteCarloWorkers; i++) {
            let act = this.spawnNode('./ChildProcessCarloWorker', messageHandler, that.lastPort);
            act.emit(["work"]);
            that.lastPort++;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
    }
}
exports.ChildProcessMonteCarloBench = ChildProcessMonteCarloBench;
//# sourceMappingURL=ChildProcessCarloMain.js.map