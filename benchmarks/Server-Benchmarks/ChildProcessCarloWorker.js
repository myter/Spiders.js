Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../benchUtils");
/**
 * Created by flo on 20/02/2017.
 */
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
//Source from : https://gist.github.com/peterc/5019804
//The only event received is "work"
function mHandler(data) {
    function calculate() {
        var MAX = 100000000;
        var r = 5;
        var points_total = 0;
        var points_inside = 0;
        while (1) {
            points_total++;
            var x = Math.random() * r * 2 - r;
            var y = Math.random() * r * 2 - r;
            if (Math.pow(x, 2) + Math.pow(y, 2) < Math.pow(r, 2))
                points_inside++;
            if (points_total % MAX == 0) {
                return (4 * points_inside / points_total);
            }
        }
    }
    calculate();
    socketToMain.emit(["done"]);
}
//# sourceMappingURL=ChildProcessCarloWorker.js.map