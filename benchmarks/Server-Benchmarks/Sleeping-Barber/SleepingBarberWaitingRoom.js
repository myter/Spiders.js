Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var capacity = 0;
var waiting = [];
var barberRef = null;
var barberSleep = true;
var knownCustomers = new Map();
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(cap, barberPort) {
        capacity = cap;
        barberRef = new benchUtils_1.ClientBufferSocket(barberPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function customerEnter(customerPort) {
        if (knownCustomers.has(customerPort)) {
            var customer = knownCustomers.get(customerPort);
        }
        else {
            var customer = new benchUtils_1.ClientBufferSocket(customerPort, mHandle);
            knownCustomers.set(customerPort, customer);
        }
        if (waiting.length == capacity) {
            customer.emit(["roomFull"]);
        }
        else {
            waiting.push(customerPort);
            if (barberSleep) {
                barberSleep = false;
                nextCustomer();
            }
        }
    }
    function nextCustomer() {
        if (waiting.length > 0) {
            var customerPort = waiting.pop();
            barberRef.emit(["newCustomer", customerPort]);
        }
        else {
            barberSleep = true;
        }
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
            break;
        case "customerEnter":
            customerEnter(data[1]);
            break;
        case "nextCustomer":
            nextCustomer();
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=SleepingBarberWaitingRoom.js.map