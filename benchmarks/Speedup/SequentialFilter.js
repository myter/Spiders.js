Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../benchUtils");
/**
 * Created by flo on 17/02/2017.
 */
var spiders = require("../../src/spiders");
function randomKernel(kernel) {
    for (var i in kernel) {
        for (var j in kernel[0]) {
            kernel[i][j] = Math.random();
        }
    }
    return kernel;
}
class SequentialFilterBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Sequential Filter", "Sequential Filter cycle completed", "Sequential Filter Completed", "Sequential Filter scheduled");
    }
    runBenchmark() {
        var that = this;
        function index_destination(width, x, y) {
            return ((width * y) + x) * 4;
        }
        function filter(kernel, pixels, width, height) {
            var kernel_w = kernel[0].length;
            var kernel_h = kernel.length;
            var new_pixels = pixels;
            var rgb_pos = [0, 1, 2];
            var hue_pos = 3;
            for (var w = 0; w < width - kernel_w; w += 1) {
                for (var h = 0; h < height - kernel_h; h += 1) {
                    var index_d = index_destination(width, w, h);
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
            that.stopPromise.resolve();
        }
        var image = benchUtils_1.BenchConfig.makeFilterImage();
        var kernel = randomKernel(benchUtils_1.BenchConfig.filterBaseKernal);
        //console.log("Sequential pixels: " + image.data.length + " width : " + image.width + " height : " + image.height)
        filter(kernel, image.data, image.width, image.height);
    }
    cleanUp() {
    }
}
exports.SequentialFilterBench = SequentialFilterBench;
//# sourceMappingURL=SequentialFilter.js.map