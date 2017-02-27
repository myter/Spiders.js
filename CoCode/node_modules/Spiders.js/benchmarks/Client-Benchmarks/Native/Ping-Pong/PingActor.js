/**
 * Created by flo on 24/01/2017.
 */
module.exports = function (self) {
    var totalPings = null;
    var pingsLeft = null;
    var pongRef = null;
    var thisWorker = self;
    function pingHandler(event) {
        function config(amPings, ponger) {
            totalPings = amPings;
            pingsLeft = amPings;
            pongRef = ponger;
            pongRef.onmessage = pingHandler;
            thisWorker.postMessage(["pingInit"]);
        }
        function start() {
            pingsLeft = totalPings;
            pongRef.postMessage(["ping"]);
            pingsLeft -= 1;
        }
        function pong() {
            if (pingsLeft == 0) {
                thisWorker.postMessage(["pingsExhausted"]);
            }
            else {
                pingsLeft -= 1;
                pongRef.postMessage(["ping"]);
            }
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.ports[0]);
                break;
            case "start":
                start();
                break;
            case "pong":
                pong();
                break;
        }
    }
    self.addEventListener('message', pingHandler);
};
//# sourceMappingURL=PingActor.js.map