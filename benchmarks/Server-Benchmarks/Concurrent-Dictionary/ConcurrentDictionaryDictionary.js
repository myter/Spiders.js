Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandler);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandler);
var data = {};
var refs = new Map();
function mHandler(data) {
    function write(key, val, senderPort) {
        data[key] = val;
        var sender = refs.get(senderPort);
        sender.emit(["work"]);
    }
    function read(key, senderPort) {
        var val = data[key];
        var sender = refs.get(senderPort);
        sender.emit(["work"]);
    }
    function link(refPort) {
        var refSocket = new benchUtils_1.ClientBufferSocket(refPort, mHandler);
        refs.set(refPort, refSocket);
        if (refs.size == benchUtils_1.BenchConfig.cDictActors) {
            socketToMain.emit(["actorInit"]);
        }
    }
    switch (data[0]) {
        case "write":
            write(data[1], data[2], data[3]);
            break;
        case "read":
            read(data[1], data[2]);
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=ConcurrentDictionaryDictionary.js.map