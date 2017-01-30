/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var managerRef = null;
    var conCost = 0;
    var conItem = 0;
    function mHandler(event) {
        function config(cc, manager) {
            conCost = cc;
            managerRef = manager;
            managerRef.onmessage = mHandler;
            self.postMessage(["actorInit"]);
        }
        function getRandom(upper) {
            return Math.floor(Math.random() * (upper - 0 + 1)) + 0;
        }
        function processItem(item, cost) {
            var result = item;
            var rand = getRandom(cost);
            if (cost > 0) {
                for (var i = 0; i < cost; i++) {
                    for (var j = 0; j < 100; j++) {
                        result += Math.log(Math.abs(getRandom(100)) + 0.01);
                    }
                }
            }
            else {
                result += Math.log(Math.abs(getRandom(100)) + 0.01);
            }
            return result;
        }
        function consume(item) {
            conItem = processItem(conItem + item, conCost);
            var chan = new MessageChannel();
            chan.port2.onmessage = mHandler;
            managerRef.postMessage(["consumerAvailable"], [chan.port1]);
        }
        function link(ref) {
            ref.onmessage = mHandler;
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.ports[0]);
                break;
            case "consume":
                consume(event.data[1]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandler);
};
//# sourceMappingURL=ProducerConsumerConsumer.js.map