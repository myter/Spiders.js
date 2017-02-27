/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var sourceId = null;
    var delayLength = null;
    var nextRef = null;
    var state = [];
    var placeHolder = 0;
    function mHandle(event) {
        function config(si, dl, next) {
            sourceId = si;
            delayLength = dl;
            nextRef = next;
            nextRef.onmessage = mHandle;
            for (var i = 0; i < delayLength; i++) {
                state[i] = 0;
            }
            self.postMessage(["actorInit"]);
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        function valueMessage(val) {
            nextRef.postMessage(["valueMessage", state[placeHolder]]);
            state[placeHolder] = val;
            placeHolder = (placeHolder + 1) % delayLength;
        }
        function exit() {
            nextRef.postMessage(["exit"]);
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.data[2], event.ports[0]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            case "valueMessage":
                valueMessage(event.data[1]);
                break;
            case "exit":
                exit();
                break;
            default:
                console.log("Unknown message (Delay): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=FilterBankDelay.js.map