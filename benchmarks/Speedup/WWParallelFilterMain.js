Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../benchUtils");
/**
 * Created by flo on 18/02/2017.
 */
class WWParallelFilterBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Web Worker Parallel Filter", "Web Worker Parallel Filter cycle completed", "Web Worker Parallel Filter completed", "Web Worker Parallel Filter scheduled");
        this.workers = [];
    }
    randomKernel(kernel) {
        for (var i in kernel) {
            for (var j in kernel[0]) {
                kernel[i][j] = Math.random();
            }
        }
        return kernel;
    }
    runBenchmark() {
        var resultsReceived = 0;
        var that = this;
        //The only even received is the "result" event
        function messageHandler(event) {
            resultsReceived += 1;
            if (resultsReceived == benchUtils_1.BenchConfig.filterImageWorkers) {
                that.stopPromise.resolve();
            }
        }
        var work = require('webworkify');
        var imageData = benchUtils_1.BenchConfig.makeFilterImage();
        var kernel = this.randomKernel(benchUtils_1.BenchConfig.filterBaseKernal);
        var totalWidth = imageData.width;
        var totalHeight = imageData.height;
        var totalPixels = imageData.data;
        var widthPerWorker = Math.ceil(totalWidth / benchUtils_1.BenchConfig.filterImageWorkers);
        //var heightPerWorker = Math.ceil(totalHeight / BenchConfig.filterImageWorkers)
        var pixelsPerWorker = Math.ceil(totalPixels.length / benchUtils_1.BenchConfig.filterImageWorkers);
        // console.log("Pixels per worker : " + pixelsPerWorker + " width " + widthPerWorker + " height " + heightPerWorker)
        for (var i = 0; i < benchUtils_1.BenchConfig.filterImageWorkers; i++) {
            let act = work(require('./WWParallelFilterWorker'));
            act.addEventListener('message', messageHandler);
            that.workers.push(act);
            var stop = pixelsPerWorker;
            if (stop > totalPixels.length) {
                stop = totalPixels.length;
            }
            var actData = totalPixels.splice(0, stop);
            act.postMessage([kernel, actData, widthPerWorker, totalHeight]);
        }
    }
    cleanUp() {
        this.cleanWorkers(this.workers);
        this.workers = [];
    }
}
exports.WWParallelFilterBench = WWParallelFilterBench;
//# sourceMappingURL=WWParallelFilterMain.js.map