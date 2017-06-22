Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../benchUtils");
/**
 * Created by flo on 17/02/2017.
 */
var spiders = require("../../src/spiders");
class Worker extends spiders.Actor {
    index_destination(width, x, y) {
        return ((width * y) + x) * 4;
    }
    filter(kernel, pixels, width, height) {
        var kernel_w = kernel[0].length;
        var kernel_h = kernel.length;
        var new_pixels = pixels;
        var rgb_pos = [0, 1, 2];
        var hue_pos = 3;
        for (var w = 0; w < width - kernel_w; w += 1) {
            for (var h = 0; h < height - kernel_h; h += 1) {
                var index_d = this.index_destination(width, w, h);
                new_pixels[index_d + hue_pos] = 255;
                for (var i = 0; i < kernel_w; i += 1) {
                    for (var j = 0; j < kernel_h; j += 1) {
                        var index_o = index_d + (i * 4) + (j * width * 4);
                        for (var x of rgb_pos)
                            new_pixels[index_d + x] += kernel[j][i] * pixels[index_o + x];
                    }
                }
            }
        }
        this.parent.result(new this.ArrayIsolate(new_pixels));
    }
}
class ParallelFilterApp extends spiders.Application {
    constructor(bench) {
        super();
        this.resultsRetrieved = 0;
        this.bench = bench;
    }
    setup(kernel, imageData) {
        var totalWidth = imageData.width;
        var totalHeight = imageData.height;
        var totalPixels = imageData.data;
        var widthPerWorker = Math.ceil(totalWidth / benchUtils_1.BenchConfig.filterImageWorkers);
        var heightPerWorker = Math.ceil(totalHeight / benchUtils_1.BenchConfig.filterImageWorkers);
        var pixelsPerWorker = Math.ceil(totalPixels.length / benchUtils_1.BenchConfig.filterImageWorkers);
        for (var i = 0; i < benchUtils_1.BenchConfig.filterImageWorkers; i++) {
            let act = this.spawnActor(Worker);
            var stop = pixelsPerWorker;
            if (stop > totalPixels.length) {
                stop = totalPixels.length;
            }
            var actData = totalPixels.splice(0, stop);
            //console.log("Sending filter to worker. Pixels : " + actData.length + " width : " + widthPerWorker + " height : " + totalHeight)
            act.filter(new this.ArrayIsolate(kernel), new this.ArrayIsolate(actData), widthPerWorker, heightPerWorker);
        }
    }
    result(pixels) {
        this.resultsRetrieved += 1;
        //console.log("Results : " + this.resultsRetrieved)
        if (this.resultsRetrieved == benchUtils_1.BenchConfig.filterImageWorkers) {
            this.bench.stopPromise.resolve();
        }
    }
}
function randomKernel(kernel) {
    for (var i in kernel) {
        for (var j in kernel[0]) {
            kernel[i][j] = Math.random();
        }
    }
    return kernel;
}
class SpiderParallelFilterBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Parallel Filter", "Parallel Filter cycle completed", "Parallel Filter completed", "Parallel Filter scheduled");
    }
    runBenchmark() {
        this.app = new ParallelFilterApp(this);
        this.app.setup(randomKernel(benchUtils_1.BenchConfig.filterBaseKernal), benchUtils_1.BenchConfig.makeFilterImage());
    }
    cleanUp() {
        this.app.kill();
    }
}
exports.SpiderParallelFilterBench = SpiderParallelFilterBench;
//# sourceMappingURL=ParallelFilter.js.map