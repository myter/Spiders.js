/**
 * Created by flo on 24/01/2017.
 */
module.exports = function (self) {
    var pingRef = null;
    var thisWorker = self;
    function pongHandler(event) {
        function config(pinger) {
            pingRef = pinger;
            pingRef.onmessage = pongHandler;
            thisWorker.postMessage(["pongInit"]);
        }
        function ping() {
            pingRef.postMessage(["pong"]);
        }
        switch (event.data[0]) {
            case "ping":
                ping();
                break;
            case "config":
                config(event.ports[0]);
                break;
        }
    }
    self.addEventListener('message', pongHandler);
};
//# sourceMappingURL=PongActor.js.map