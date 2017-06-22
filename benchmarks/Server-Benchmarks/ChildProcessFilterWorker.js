Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 19/02/2017.
 */
const benchUtils_1 = require("../benchUtils");
/**
 * Created by flo on 19/02/2017.
 */
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
//The only event received is "filter"
function mHandler(data) {
    var k = data[0];
    var p = data[1];
    var w = data[2];
    var h = data[3];
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
        socketToMain.emit([new_pixels]);
    }
    filter(k, p, w, h);
}
//# sourceMappingURL=ChildProcessFilterWorker.js.map