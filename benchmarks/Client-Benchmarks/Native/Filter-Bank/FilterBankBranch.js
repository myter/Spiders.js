/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var banks = [];
    var integrateRef = null;
    function mHandle(event) {
        function config(integrate) {
            integrateRef = integrate;
            integrateRef.onmessage = mHandle;
        }
        function newBank(bankRef) {
            banks.push(bankRef);
            bankRef.onmessage = mHandle;
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        function configDone() {
            self.postMessage(["actorInit"]);
        }
        function valueMessage(val) {
            for (var i in banks) {
                banks[i].postMessage(["valueMessage", val]);
            }
        }
        function exit() {
            for (var i in banks) {
                banks[i].postMessage(["exit"]);
            }
        }
        switch (event.data[0]) {
            case "config":
                config(event.ports[0]);
                break;
            case "newBank":
                newBank(event.ports[0]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            case "configDone":
                configDone();
                break;
            case "valueMessage":
                valueMessage(event.data[1]);
                break;
            case "exit":
                exit();
                break;
            default:
                console.log("Unknown message (Branch): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=FilterBankBranch.js.map