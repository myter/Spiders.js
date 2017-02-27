/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var data = {};
    function mHandler(event) {
        function write(sender, key, val) {
            data[key] = val;
            sender.postMessage(["work"]);
        }
        function read(sender, key) {
            var val = data[key];
            sender.postMessage(["work"]);
        }
        function link(ref) {
            ref.onmessage = mHandler;
        }
        switch (event.data[0]) {
            case "write":
                write(event.ports[0], event.data[1], event.data[2]);
                break;
            case "read":
                read(event.ports[0], event.data[1]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandler);
    self.postMessage(["actorInit"]);
};
//# sourceMappingURL=ConcurrentDictionaryDictionary.js.map