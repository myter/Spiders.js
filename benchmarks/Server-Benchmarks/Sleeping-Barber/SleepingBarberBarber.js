Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var haircutRate = null;
var roomRef = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
var knownCustomers = new Map();
function mHandle(data) {
    function config(hr) {
        haircutRate = hr;
    }
    function linkRoom(roomPort) {
        roomRef = new benchUtils_1.ClientBufferSocket(roomPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function busyWait(limit) {
        for (var i = 0; i < limit; i++) {
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }
    function newCustomer(customerPort) {
        busyWait(haircutRate);
        if (knownCustomers.has(customerPort)) {
            var customer = knownCustomers.get(customerPort);
        }
        else {
            var customer = new benchUtils_1.ClientBufferSocket(customerPort, mHandle);
            knownCustomers.set(customerPort, customer);
        }
        customer.emit(["done"]);
        roomRef.emit(["nextCustomer"]);
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "linkRoom":
            linkRoom(data[1]);
            break;
        case "newCustomer":
            newCustomer(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=SleepingBarberBarber.js.map