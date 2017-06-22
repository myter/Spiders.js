Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var masterRef = null;
var id = null;
var threshold = null;
var size = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(i, thresh, s, masterPort) {
        masterRef = new benchUtils_1.ClientBufferSocket(masterPort, mHandle);
        id = i;
        threshold = thresh;
        size = s;
        socketToMain.emit(["actorInit"]);
    }
    function arraycopy(a1, start1, a2, start2, until) {
        var index = start2;
        for (var i = start1; i < until; i++) {
            a2[index] = a1[i];
            index += 1;
        }
    }
    function boardValid(depth, data) {
        var p = 0;
        var q = 0;
        for (var i = 0; i < depth; i++) {
            p = data[i];
            for (var j = (i + 1); j < data; j++) {
                q = data[j];
                if (q == p || q == p - (j - i) || q == p + (j - 1)) {
                    return false;
                }
            }
        }
        return true;
    }
    function workSequential(data, depth) {
        if (size == depth) {
            masterRef.emit(["result"]);
        }
        else {
            var b = [];
            for (var i = 0; i < depth + 1; i++) {
                b[i] = 0;
            }
            var j = 0;
            while (j < size) {
                arraycopy(data, 0, b, 0, depth);
                b[depth] = j;
                if (boardValid(depth + 1, b)) {
                    workSequential(b, depth + 1);
                }
                j += 1;
            }
        }
    }
    function work(priority, data, depth) {
        if (size == depth) {
            masterRef.emit(["result"]);
        }
        else if (depth >= threshold) {
            workSequential(data, depth);
        }
        else {
            var newPriority = priority - 1;
            var newDepth = depth + 1;
            var i = 0;
            while (i < size) {
                var b = [];
                for (var j = 0; j < newDepth; j++) {
                    b[j] = 0;
                }
                arraycopy(data, 0, b, 0, depth);
                b[depth] = i;
                if (boardValid(newDepth, b)) {
                    masterRef.emit(["sendWork", newPriority, b, newDepth]);
                }
                i += 1;
            }
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3], data[4]);
            break;
        case "work":
            work(data[1], data[2], data[3]);
            break;
        default:
            console.log("Unknown message (Worker): " + data[0]);
    }
}
//# sourceMappingURL=NQueensFirstNSolutionsWorker.js.map