/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var count = 0;
    function mHandle(event) {
        function valueMessage(val) {
            count += 1;
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        switch (event.data[0]) {
            case "valueMessage":
                valueMessage(event.data[1]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            default:
                console.log("Unknown message (Sink): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
    self.postMessage(["actorInit"]);
};
//# sourceMappingURL=FilterBankSink.js.map