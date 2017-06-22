Object.defineProperty(exports, "__esModule", { value: true });
const PingPongMain_1 = require("./PingPongMain");
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 07/02/2017.
 */
new benchUtils_1.ServerBufferSocket(PingPongMain_1.NodePingPongBench._PONG_PORT_, pongHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, pongHandler);
var pingSocket = null;
function pongHandler(data) {
    function config() {
        pingSocket = new benchUtils_1.ClientBufferSocket(PingPongMain_1.NodePingPongBench._PING_PORT_, pongHandler);
        socketToMain.emit(["pongInit"]);
    }
    function ping() {
        pingSocket.emit(["pong"]);
    }
    switch (data[0]) {
        case "ping":
            ping();
            break;
        case "config":
            config();
            break;
    }
}
//# sourceMappingURL=PongActor.js.map