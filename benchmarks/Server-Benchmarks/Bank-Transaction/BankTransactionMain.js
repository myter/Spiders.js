Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
class NodeBankTransactionBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Banking transaction", "Node Banking Transaction cycle completed", "Node Banking Transaction completed", "Node Banking Transaction scheduled");
        this.lastPort = 8002;
        this.accounts = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.bankingAccounts + 1) {
                    that.tellerRef.emit(["start"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                default:
                    console.log("Unknown message: " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.tellerRef = that.spawnNode("Bank-Transaction/BankTransactionTeller", sysHandle, NodeBankTransactionBench._TELLER_PORT_);
        var accCount = benchUtils_1.BenchConfig.bankingAccounts - 1;
        while (accCount >= 0) {
            var newAcc = that.spawnNode("Bank-Transaction/BankTransactionAccount", sysHandle, that.lastPort);
            that.accounts.push(newAcc);
            that.tellerRef.emit(["newAccount", benchUtils_1.BenchConfig.bankingAccounts, benchUtils_1.BenchConfig.bankingTransactions, that.lastPort]);
            newAcc.emit(["config", benchUtils_1.BenchConfig.bankingInitialBalance, NodeBankTransactionBench._TELLER_PORT_]);
            that.lastPort++;
            accCount -= 1;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.accounts = [];
    }
}
NodeBankTransactionBench._TELLER_PORT_ = 8001;
exports.NodeBankTransactionBench = NodeBankTransactionBench;
//# sourceMappingURL=BankTransactionMain.js.map