Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../benchUtils");
/**
 * Created by flo on 20/02/2017.
 */
class WWCarloBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Web Worker Monte Carlo", "Web Worker Monte Carlo cycle completed", "Web Worker Monte Carlo completed", "Web Worker Monte Carlo scheduled");
        this.workers = [];
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
        var work = require('webworkify');
        for (var i = 0; i < benchUtils_1.BenchConfig.monteCarloWorkers; i++) {
            let act = work(require('./WWCarloWorker'));
            act.addEventListener('message', messageHandler);
            act.postMessage(["calc"]);
        }
    }
    cleanUp() {
        this.cleanWorkers(this.workers);
        this.workers = [];
    }
}
exports.WWCarloBench = WWCarloBench;
//# sourceMappingURL=WWCarloMain.js.map