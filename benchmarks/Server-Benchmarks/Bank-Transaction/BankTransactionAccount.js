Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
var balance = 0;
var tellerRef = null;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
var knownDestinations = new Map();
function mHandle(data) {
    function config(initialBalance, tellerPort) {
        balance = initialBalance;
        tellerRef = new benchUtils_1.ClientBufferSocket(tellerPort, mHandle);
        socketToMain.emit(["actorInit"]);
    }
    function credit(amount, destinationPort) {
        balance -= amount;
        if (knownDestinations.has(destinationPort)) {
            var destination = knownDestinations.get(destinationPort);
        }
        else {
            var destination = new benchUtils_1.ClientBufferSocket(destinationPort, mHandle);
            knownDestinations.set(destinationPort, destination);
        }
        destination.emit(["debit", amount]);
    }
    function debit(amount) {
        balance += amount;
        setTimeout(function () {
            tellerRef.emit(["transactionDone"]);
        }, 100);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
            break;
        case "credit":
            credit(data[1], data[2]);
            break;
        case "debit":
            debit(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=BankTransactionAccount.js.map