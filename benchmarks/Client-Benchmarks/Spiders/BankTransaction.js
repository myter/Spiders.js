const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class Account extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.balance = 0;
    }
    config(initialBalance) {
        this.balance = initialBalance;
        this.parent.actorInit();
    }
    credit(teller, amount, destination) {
        this.balance -= amount;
        destination.debit(amount).then((v) => {
            teller.transactionDone();
        });
    }
    debit(amount) {
        this.balance += amount;
        return 'ok';
    }
}
class Teller extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.totalAccounts = 0;
        this.totalTransactions = 0;
        this.accounts = [];
        this.currentTransactions = 0;
    }
    newAccount(totalAccounts, totalTransactions, accountRef) {
        this.totalAccounts = totalAccounts;
        this.totalTransactions = totalTransactions;
        this.accounts.push(accountRef);
        if (this.totalAccounts == this.accounts.length) {
            this.parent.actorInit();
        }
    }
    getRandom(upper) {
        return Math.floor(Math.random() * (upper - 0) + 0);
    }
    start() {
        var i = 0;
        while (i < this.totalTransactions) {
            this.generateWork();
            i++;
        }
    }
    generateWork() {
        var sourceAccount = this.getRandom(this.accounts.length);
        var destAccount = this.getRandom(this.accounts.length);
        if (destAccount == sourceAccount) {
            destAccount = (destAccount + 1) % this.accounts.length;
        }
        var amount = this.getRandom(1000);
        this.accounts[sourceAccount].credit(this, amount, this.accounts[destAccount]);
    }
    transactionDone() {
        this.currentTransactions += 1;
        if (this.currentTransactions == this.totalTransactions) {
            this.parent.end();
        }
    }
}
class BankTransactionApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.accounts = [];
        this.bench = bench;
    }
    setup() {
        this.tellerRef = this.spawnActor(Teller);
        var accCount = benchUtils_1.BenchConfig.bankingAccounts - 1;
        while (accCount >= 0) {
            var newAcc = this.spawnActor(Account);
            this.accounts.push(newAcc);
            newAcc.config(benchUtils_1.BenchConfig.bankingInitialBalance);
            this.tellerRef.newAccount(benchUtils_1.BenchConfig.bankingAccounts, benchUtils_1.BenchConfig.bankingTransactions, newAcc);
            accCount -= 1;
        }
    }
    checkConfig() {
        if (this.actorsInitialised == benchUtils_1.BenchConfig.bankingAccounts + 1) {
            this.tellerRef.start();
        }
    }
    actorInit() {
        this.actorsInitialised += 1;
        this.checkConfig();
    }
    end() {
        this.bench.stopPromise.resolve();
    }
}
class SpiderBankTransactionBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Banking Transaction", "Spiders.js Banking Transaction cycle completed", "Spiders.js Banking Transaction completed", "Spiders.js Banking Transaction scheduled");
    }
    runBenchmark() {
        this.bankingTransactionApp = new BankTransactionApp(this);
        this.bankingTransactionApp.setup();
    }
    cleanUp() {
        this.bankingTransactionApp.kill();
        this.bankingTransactionApp.accounts = [];
    }
}
exports.SpiderBankTransactionBench = SpiderBankTransactionBench;
//# sourceMappingURL=BankTransaction.js.map