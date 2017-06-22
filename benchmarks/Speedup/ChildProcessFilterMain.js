Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../benchUtils");
class ChildProcessFilterBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Child Process Parallel Filter", "Child Process Parallel Filter cycle completed", "Child Process Parallel Filter completed", "Child Process Parallel Filter scheduled");
        this.lastPort = 8001;
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
        this.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, messageHandler);
        var imageData = benchUtils_1.BenchConfig.makeFilterImage();
        var kernel = this.randomKernel(benchUtils_1.BenchConfig.filterBaseKernal);
        var totalWidth = imageData.width;
        var totalHeight = imageData.height;
        var totalPixels = imageData.data;
        var widthPerWorker = Math.ceil(totalWidth / benchUtils_1.BenchConfig.filterImageWorkers);
        var heightPerWorker = Math.ceil(totalHeight / benchUtils_1.BenchConfig.filterImageWorkers);
        var pixelsPerWorker = Math.ceil(totalPixels.length / benchUtils_1.BenchConfig.filterImageWorkers);
        // console.log("Pixels per worker : " + pixelsPerWorker + " width " + widthPerWorker + " height " + heightPerWorker)
        for (var i = 0; i < benchUtils_1.BenchConfig.filterImageWorkers; i++) {
            let act = this.spawnNode('./ChildProcessFilterWorker', messageHandler, that.lastPort);
            var stop = pixelsPerWorker;
            if (stop > totalPixels.length) {
                stop = totalPixels.length;
            }
            var actData = totalPixels.splice(0, stop);
            act.emit([kernel, actData, widthPerWorker, heightPerWorker]);
            that.lastPort++;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
    }
}
exports.ChildProcessFilterBench = ChildProcessFilterBench;
//# sourceMappingURL=ChildProcessFilterMain.js.map