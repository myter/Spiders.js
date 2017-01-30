/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var sinkRef = null;
    var neighbours = [];
    var pingsReceived = 0;
    var pingsExpected = 0;
    function mHandler(event) {
        function setSink(sink) {
            sink.onmessage = mHandler;
            sinkRef = sink;
        }
        function neighbour(ref, totalAmount, totalPings) {
            pingsExpected = totalPings;
            ref.onmessage = mHandler;
            neighbours.push(ref);
            if (neighbours.length == totalAmount - 1) {
                self.postMessage(["actorInit"]);
            }
        }
        function ping(sender) {
            sender.postMessage(["pong"]);
        }
        function link(ref) {
            ref.onmessage = mHandler;
        }
        function pong() {
            if (pingsReceived == pingsExpected) {
                sinkRef.postMessage(["exit"]);
            }
            else {
                pingsReceived += 1;
                var targetIndex = Math.floor((Math.random() * neighbours.length));
                var target = neighbours[targetIndex];
                var chan = new MessageChannel();
                chan.port2.onmessage = mHandler;
                target.postMessage(["ping"], [chan.port1]);
            }
        }
        switch (event.data[0]) {
            case "setSink":
                setSink(event.ports[0]);
                break;
            case "neighbour":
                neighbour(event.ports[0], event.data[1], event.data[2]);
                break;
            case "ping":
                ping(event.ports[0]);
                break;
            case "pong":
                pong();
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
//# sourceMappingURL=BigActor.js.map