/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var sourceRef = null;
    var totalSimulations = null;
    var messagesSent = 0;
    function mHandle(event) {
        function config(ts, source) {
            totalSimulations = ts;
            sourceRef = source;
            sourceRef.onmessage = mHandle;
            self.postMessage(["actorInit"]);
        }
        function nextMessage() {
            if (messagesSent == totalSimulations) {
                sourceRef.postMessage(["exit"]);
            }
            else {
                sourceRef.postMessage(["boot"]);
                messagesSent += 1;
            }
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.ports[0]);
                break;
            case "nextMessage":
                nextMessage();
                break;
            case "link":
                link(event.ports[0]);
                break;
            default:
                console.log("Unknown message (Producer): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=FilterBankProducer.js.map