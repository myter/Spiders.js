/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var left = null;
    var right = null;
    var precision = null;
    var workers = [];
    var termsReceived = 0;
    var resultArea = 0.0;
    function mHandle(event) {
        function config(l, r, p) {
            left = l;
            right = r;
            precision = p;
        }
        function newWorker(ref) {
            ref.onmessage = mHandle;
            workers.push(ref);
        }
        function configDone() {
            self.postMessage(["actorInit"]);
        }
        function work() {
            var workerRange = (right - left) / workers.length;
            var index = 0;
            for (var i in workers) {
                var wl = (workerRange * index) + left;
                var wr = wl + workerRange;
                workers[i].postMessage(["work", wl, wr, precision]);
                index += 1;
            }
        }
        function result(area, id) {
            termsReceived += 1;
            resultArea += area;
            if (termsReceived == workers.length) {
                self.postMessage(["actorExit"]);
            }
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.data[2], event.data[3]);
                break;
            case "configDone":
                configDone();
                break;
            case "newWorker":
                newWorker(event.ports[0]);
                break;
            case "work":
                work();
                break;
            case "link":
                link(event.ports[0]);
                break;
            case "result":
                result(event.data[1], event.data[2]);
                break;
            default:
                console.log("Unknown message (Master): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=TrapezoidalApproximationMaster.js.map