Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var totalHaircuts = 0;
var productionRate = 0;
var currentHaircuts = 0;
var roomRef = null;
var customers = new Map();
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(th, pr, roomPort) {
        totalHaircuts = th;
        productionRate = pr;
        roomRef = new benchUtils_1.ClientBufferSocket(roomPort, mHandle);
    }
    function newCustomer(customerPort) {
        var customer = new benchUtils_1.ClientBufferSocket(customerPort, mHandle);
        customers.set(customerPort, customer);
        if (customers.size == totalHaircuts) {
            socketToMain.emit(["actorInit"]);
        }
    }
    function busyWait(limit) {
        for (var i = 0; i < limit; i++) {
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }
    function start() {
        customers.forEach((_, customerPort) => {
            roomRef.emit(["customerEnter", customerPort]);
            busyWait(productionRate);
        });
    }
    function returned(customerPort) {
        roomRef.emit(["customerEnter", customerPort]);
    }
    function done() {
        currentHaircuts += 1;
        if (currentHaircuts == totalHaircuts) {
            socketToMain.emit(["end"]);
        }
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3]);
            break;
        case "newCustomer":
            newCustomer(data[1]);
            break;
        case "start":
            start();
            break;
        case "returned":
            returned(data[1]);
            break;
        case "done":
            done();
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=SleepingBarberCustomerFactory.js.map