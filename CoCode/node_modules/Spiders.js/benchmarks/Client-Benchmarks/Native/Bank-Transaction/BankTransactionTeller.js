/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var totalAccounts = 0;
    var totalTransactions = 0;
    var accounts = [];
    var currentTransactions = 0;
    function mHandler(event) {
        function newAccount(ta, tt, accountRef) {
            totalAccounts = ta;
            totalTransactions = tt;
            accounts.push(accountRef);
            accountRef.onmessage = mHandler;
            if (totalAccounts == accounts.length) {
                self.postMessage(["actorInit"]);
            }
        }
        function getRandom(upper) {
            return Math.floor(Math.random() * (upper - 0) + 0);
        }
        function start() {
            var i = 0;
            while (i < totalTransactions) {
                generateWork();
                i++;
            }
        }
        function generateWork() {
            var sourceAccount = getRandom(accounts.length);
            var destAccount = getRandom(accounts.length);
            if (destAccount == sourceAccount) {
                destAccount = (destAccount + 1) % accounts.length;
            }
            var amount = getRandom(1000);
            var chan = new MessageChannel();
            var temp = accounts[destAccount];
            accounts[destAccount].postMessage(["reLink"], [chan.port1]);
            chan.port2.onmessage = mHandler;
            accounts[destAccount] = chan.port2;
            accounts[sourceAccount].postMessage(["credit", amount], [temp]);
        }
        function transactionDone() {
            currentTransactions += 1;
            if (currentTransactions == totalTransactions) {
                self.postMessage(["end"]);
            }
        }
        switch (event.data[0]) {
            case "newAccount":
                newAccount(event.data[1], event.data[2], event.ports[0]);
                break;
            case "start":
                start();
                break;
            case "generateWork":
                generateWork();
                break;
            case "transactionDone":
                transactionDone();
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandler);
};
//# sourceMappingURL=BankTransactionTeller.js.map