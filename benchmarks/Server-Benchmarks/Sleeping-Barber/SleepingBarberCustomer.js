Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var factoryRef = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(factoryPort) {
        factoryRef = new benchUtils_1.ClientBufferSocket(factoryPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function roomFull() {
        factoryRef.emit(["returned", myPort]);
    }
    function done() {
        factoryRef.emit(["done"]);
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "roomFull":
            roomFull();
            break;
        case "done":
            done();
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=SleepingBarberCustomer.js.map