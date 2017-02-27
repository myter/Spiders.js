/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var meetingsHeld = 0;
    var color = null;
    function mHandler(event) {
        function config(cr) {
            color = cr;
            self.postMessage(["actorInit"]);
        }
        function startGame() {
            var chan = new MessageChannel();
            chan.port2.onmessage = mHandler;
            self.postMessage(["meet", color], [chan.port1]);
        }
        function exitGame() {
            color = -1;
            self.postMessage(["meetCount", meetingsHeld]);
        }
        function meet(sender, otherColor) {
            color = complement(otherColor);
            meetingsHeld += 1;
            sender.postMessage(["changeColor", color]);
            var chan = new MessageChannel();
            chan.port2.onmessage = mHandler;
            self.postMessage(["meet", color], [chan.port1]);
        }
        function changeColor(color) {
            color = color;
            meetingsHeld += 1;
            var chan = new MessageChannel();
            chan.port2.onmessage = mHandler;
            self.postMessage(["meet", color], [chan.port1]);
        }
        function complement(otherColor) {
            switch (color) {
                case -1: return -1;
                case 0:
                    switch (otherColor) {
                        case 1: return 2;
                        case 2: return 1;
                        case 0: return 0;
                        case -1: return -1;
                    }
                    ;
                case 1:
                    switch (otherColor) {
                        case 1: return 1;
                        case 2: return 0;
                        case 0: return 2;
                        case -1: return -1;
                    }
                case 2:
                    switch (otherColor) {
                        case 1: return 0;
                        case 2: return 2;
                        case 0: return 1;
                        case -1: return -1;
                    }
            }
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1]);
                break;
            case "startGame":
                startGame();
                break;
            case "exitGame":
                exitGame();
                break;
            case "meet":
                meet(event.ports[0], event.data[1]);
                break;
            case "changeColor":
                changeColor(event.data[1]);
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandler);
};
//# sourceMappingURL=ChameneoActor.js.map