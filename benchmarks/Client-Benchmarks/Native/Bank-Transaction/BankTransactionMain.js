const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 26/01/2017.
 */
class NatBankTransactionBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Banking transaction", "Native Banking Transaction cycle completed", "Native Banking Transaction completed", "Native Banking Transaction scheduled");
        this.accounts = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(event) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.bankingAccounts + 1) {
                    that.tellerRef.postMessage(["start"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                default:
                    console.log("Unknown message: " + event.data[0]);
            }
        }
        that.tellerRef = that.spawnWorker(require('./BankTransactionTeller.js'));
        that.tellerRef.onmessage = sysHandle;
        var accCount = benchUtils_1.BenchConfig.bankingAccounts - 1;
        while (accCount >= 0) {
            var newAcc = that.spawnWorker(require('./BankTransactionAccount.js'));
            that.accounts.push(newAcc);
            newAcc.onmessage = sysHandle;
            var chan = new MessageChannel();
            that.tellerRef.postMessage(["newAccount", benchUtils_1.BenchConfig.bankingAccounts, benchUtils_1.BenchConfig.bankingTransactions], [chan.port1]);
            newAcc.postMessage(["config", benchUtils_1.BenchConfig.bankingInitialBalance], [chan.port2]);
            accCount -= 1;
        }
    }
    cleanUp() {
        this.accounts.push(this.tellerRef);
        this.cleanWorkers(this.accounts);
        this.accounts = [];
    }
}
exports.NatBankTransactionBench = NatBankTransactionBench;
//# sourceMappingURL=BankTransactionMain.js.map