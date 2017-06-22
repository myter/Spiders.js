Object.defineProperty(exports, "__esModule", { value: true });
const PingPongMain_1 = require("./PingPongMain");
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 07/02/2017.
 */
new benchUtils_1.ServerBufferSocket(PingPongMain_1.NodePingPongBench._PING_PORT_, pingHandler);
var totalPings = null;
var pingsLeft = null;
var pongSocket = null;
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, pingHandler);
function pingHandler(data) {
    function config(amPings) {
        totalPings = amPings;
        pingsLeft = amPings;
        pongSocket = new benchUtils_1.ClientBufferSocket(PingPongMain_1.NodePingPongBench._PONG_PORT_, pingHandler);
        socketToMain.emit(["pingInit"]);
    }
    function start() {
        pingsLeft = totalPings;
        pongSocket.emit(["ping"]);
        pingsLeft -= 1;
    }
    function pong() {
        if (pingsLeft == 0) {
            socketToMain.emit(["pingsExhausted"]);
        }
        else {
            pingsLeft -= 1;
            pongSocket.emit(["ping"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "start":
            start();
            break;
        case "pong":
            pong();
            break;
        default:
            console.log("Ping did not understand : " + data[0]);
    }
}
//# sourceMappingURL=PingActor.js.map