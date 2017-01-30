/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var totalCount = null;
    var countSoFar = null;
    var thisWorker = self;
    function countHandler(event) {
        function config(countNumber, someRef) {
            totalCount = countNumber;
            countSoFar = 0;
            someRef.onmessage = countHandler;
            this.postMessage(["countInit"]);
        }
        function inc(fresh) {
            if (fresh) {
                countSoFar = 0;
            }
            else {
                countSoFar += 1;
                if (countSoFar == totalCount) {
                    thisWorker.postMessage(["countsExhausted"]);
                }
            }
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.ports[0]);
                break;
            case "inc":
                inc(event.data[1]);
                break;
        }
    }
    self.addEventListener('message', countHandler);
};
//# sourceMappingURL=CountCounter.js.map