/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var totalChannels = null;
    var combineRef = null;
    var data = {};
    var dataIndex = 0;
    var exitsReceived = 0;
    function mHandle(event) {
        function config(tc, combine) {
            totalChannels = tc;
            combineRef = combine;
            combineRef.onmessage = mHandle;
            self.postMessage(["actorInit"]);
        }
        function removeEntry(key) {
            var copy = {};
            for (var i in data) {
                if (!(i == key)) {
                    copy[key] = data[key];
                }
            }
            data = copy;
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        function sourceValueMessage(sourceId, val) {
            var dataSize = 0;
            for (var i in data) {
                dataSize += 1;
            }
            var processed = false;
            var j = 0;
            while (j < dataSize) {
                var loopMap = data[j];
                if (!(sourceId in loopMap)) {
                    loopMap[sourceId] = val;
                    processed = true;
                    j = dataSize;
                }
                j += 1;
            }
            if (!processed) {
                var newMap = {};
                newMap[sourceId] = val;
                data[dataIndex] = newMap;
                dataIndex += 1;
            }
            var firstMap = data[0];
            var firstMapSize = 0;
            for (var i in firstMap) {
                firstMapSize += 1;
            }
            if (firstMapSize == totalChannels) {
                for (var i in firstMap) {
                    combineRef.postMessage(["newVal", firstMap[i]]);
                }
                combineRef.postMessage(["valEnd"]);
                removeEntry(0);
            }
        }
        function exit() {
            exitsReceived += 1;
            if (exitsReceived == totalChannels) {
                self.postMessage(["end"]);
            }
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.ports[0]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            case "sourceValueMessage":
                sourceValueMessage(event.data[1], event.data[2]);
                break;
            case "exit":
                exit();
                break;
            default:
                console.log("Unknown message (Integrator): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=FilterBankIntegrator.js.map