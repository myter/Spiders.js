/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var rate = 0;
    function mHandle(event) {
        function config(r) {
            rate = r;
            self.postMessage(["actorInit"]);
        }
        function compute(term, requester) {
            var res = rate * term * (1 - term);
            requester.postMessage(["termDone", res]);
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1]);
                break;
            case "compute":
                compute(event.data[1], event.ports[0]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=LogisticMapSeriesRate.js.map