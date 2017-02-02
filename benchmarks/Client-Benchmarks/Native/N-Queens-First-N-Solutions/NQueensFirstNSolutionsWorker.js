/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var masterRef = null;
    var id = null;
    var threshold = null;
    var size = null;
    function mHandle(event) {
        function config(master, i, thresh, s) {
            masterRef = master;
            masterRef.onmessage = mHandle;
            id = i;
            threshold = thresh;
            size = s;
            self.postMessage(["actorInit"]);
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
            if (size >= depth) {
                masterRef.postMessage(["result"]);
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
                masterRef.postMessage(["result"]);
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
                        masterRef.postMessage(["sendWork", newPriority, b, newDepth]);
                    }
                    i += 1;
                }
            }
            masterRef.postMessage(["done"]);
        }
        switch (event.data[0]) {
            case "config":
                config(event.ports[0], event.data[1], event.data[2], event.data[3]);
                break;
            case "work":
                work(event.data[1], event.data[2], event.data[3]);
                break;
            default:
                console.log("Unknown message (Worker): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=NQueensFirstNSolutionsWorker.js.map