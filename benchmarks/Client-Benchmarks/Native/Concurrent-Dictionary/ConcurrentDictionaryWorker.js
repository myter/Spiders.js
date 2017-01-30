/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var masterRef = null;
    var dictRef = null;
    var writePercentage = 0;
    var totalMsgs = 0;
    var currentMsgs = 0;
    function mHandler(event) {
        function config(writePercentage, totalMsgs) {
            writePercentage = writePercentage;
            totalMsgs = totalMsgs;
            self.postMessage(["actorInit"]);
        }
        function linkMaster(master) {
            masterRef = master;
            masterRef.onmessage = mHandler;
        }
        function linkDict(dict) {
            dictRef = dict;
            dictRef.onmessage = mHandler;
        }
        function getRandom() {
            return Math.floor(Math.random() * (100 - 0 + 1)) + 0;
        }
        function work() {
            currentMsgs += 1;
            if (currentMsgs <= totalMsgs) {
                var rand = getRandom();
                if (rand < writePercentage) {
                    var key = getRandom();
                    var val = getRandom();
                    dictRef.postMessage(["write", key, val]);
                }
                else {
                    var key = getRandom();
                    var chan = new MessageChannel();
                    chan.port2.onmessage = mHandler;
                    dictRef.postMessage(["read", key], [chan.port1]);
                }
            }
            else {
                masterRef.postMessage(["workerDone"]);
            }
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.data[2]);
                break;
            case "work":
                work();
                break;
            case "linkMaster":
                linkMaster(event.ports[0]);
                break;
            case "linkDict":
                linkDict(event.ports[0]);
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandler);
};
//# sourceMappingURL=ConcurrentDictionaryWorker.js.map