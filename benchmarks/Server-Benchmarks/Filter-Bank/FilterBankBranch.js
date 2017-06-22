Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var banks = [];
var integrateRef = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(integratePort) {
        integrateRef = new benchUtils_1.ClientBufferSocket(integratePort, mHandle);
    }
    function newBank(bankRefPort) {
        banks.push(new benchUtils_1.ClientBufferSocket(bankRefPort, mHandle));
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    function configDone() {
        socketToMain.emit(["actorInit"]);
    }
    function valueMessage(val) {
        for (var i in banks) {
            banks[i].emit(["valueMessage", val]);
        }
    }
    function exit() {
        for (var i in banks) {
            banks[i].emit(["exit"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "newBank":
            newBank(data[1]);
            break;
        case "link":
            link(data[1]);
            break;
        case "configDone":
            configDone();
            break;
        case "valueMessage":
            valueMessage(data[1]);
            break;
        case "exit":
            exit();
            break;
        default:
            console.log("Unknown message (Branch): " + data[0]);
    }
}
//# sourceMappingURL=FilterBankBranch.js.map