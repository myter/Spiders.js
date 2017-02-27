/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var sourceId = null;
    var peekLength = null;
    var coef = [];
    var nextRef = null;
    var data = [];
    var dataIndex = 0;
    var dataFull = false;
    function mHandle(event) {
        function config(si, pl, next) {
            sourceId = si;
            peekLength = pl;
            nextRef = next;
            nextRef.onmessage = mHandle;
            for (var i = 0; i < peekLength; i++) {
                data[i] = 0;
            }
        }
        function newCoef(c) {
            coef.push(c);
        }
        function configDone() {
            self.postMessage(["actorInit"]);
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        function valueMessage(val) {
            data[dataIndex] = val;
            dataIndex += 1;
            if (dataIndex == peekLength) {
                dataFull = true;
                dataIndex = 0;
            }
            if (dataFull) {
                var sum = 0.0;
                var i = 0;
                while (i < peekLength) {
                    sum += data[i] * coef[peekLength - i - 1];
                    i += 1;
                }
                nextRef.postMessage(["valueMessage", sum]);
            }
        }
        function exit() {
            nextRef.postMessage(["exit"]);
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.data[2], event.ports[0]);
                break;
            case "newCoef":
                newCoef(event.data[1]);
                break;
            case "configDone":
                configDone();
                break;
            case "valueMessage":
                valueMessage(event.data[1]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            case "exit":
                exit();
                break;
            default:
                console.log("Unknown message (Fir Filter): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=FilterBankFirFilter.js.map