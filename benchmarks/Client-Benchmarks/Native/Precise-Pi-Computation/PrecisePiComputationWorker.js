/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var masterRef = null;
    var id = null;
    function mHandle(event) {
        function config(master, i) {
            masterRef = master;
            masterRef.onmessage = mHandle;
            id = i;
            self.postMessage(["actorInit"]);
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/decimal.js/7.1.1/decimal.min.js');
        }
        function pi(precision) {
            // the Bailey-Borwein-Plouffe formula
            // http://stackoverflow.com/questions/4484489/using-basic-arithmetics-for-calculating-pi-with-arbitary-precision
            var p16 = new this.Decimal(1);
            var pi = new this.Decimal(0);
            var one = new this.Decimal(1);
            var two = new this.Decimal(2);
            var four = new this.Decimal(4);
            var k8 = new this.Decimal(0);
            for (var k = new this.Decimal(0); k.lte(precision); k = k.plus(one)) {
                // pi += 1/p16 * (4/(8*k + 1) - 2/(8*k + 4) - 1/(8*k + 5) - 1/(8*k+6));
                // p16 *= 16;
                //
                // a little simpler:
                // pi += p16 * (4/(8*k + 1) - 2/(8*k + 4) - 1/(8*k + 5) - 1/(8*k+6));
                // p16 /= 16;
                var f = four.div(k8.plus(1))
                    .minus(two.div(k8.plus(4)))
                    .minus(one.div(k8.plus(5)))
                    .minus(one.div(k8.plus(6)));
                pi = pi.plus(p16.times(f));
                p16 = p16.div(16);
                k8 = k8.plus(8);
            }
            return pi;
        }
        function calculateBbpTerm(precision, term) {
            //At this point getting the actual term does not matter
            //Naive implementation of benchmark which simply calculated pi for the given precies for each term
            var piNum = pi(precision);
        }
        function work(precision, term) {
            var result = calculateBbpTerm(precision, term);
            masterRef.postMessage(["gotResult", result, id]);
        }
        function stop() {
            masterRef.postMessage(["workerStopped"]);
        }
        switch (event.data[0]) {
            case "config":
                config(event.ports[0], event.data[1]);
                break;
            case "work":
                work(event.data[1], event.data[2]);
                break;
            case "stop":
                stop();
                break;
            default:
                console.log("Unknown message (Worker): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=PrecisePiComputationWorker.js.map