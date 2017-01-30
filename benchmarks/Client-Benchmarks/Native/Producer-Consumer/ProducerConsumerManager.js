/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var allConsumers = [];
    var availableConsumers = [];
    var availableProducers = [];
    var totalConsumers = 0;
    var totalProducers = 0;
    var adjustBuffer = 0;
    var producersStopped = 0;
    var pendingData = [];
    function mHandler(event) {
        function config(bufferSize, tc, tp) {
            totalConsumers = tc;
            totalProducers = tp;
            adjustBuffer = bufferSize - totalProducers;
        }
        function registerConsumer(consumerRef) {
            availableConsumers.push(consumerRef);
            consumerRef.onmessage = mHandler;
            if (availableConsumers.length == totalConsumers) {
                self.postMessage(["actorInit"]);
            }
        }
        function newDataProduced(producer, item) {
            producer.onmessage = mHandler;
            if (availableConsumers.length == 0) {
                pendingData.push(item);
            }
            else {
                var consumer = availableConsumers.pop();
                consumer.postMessage(["consume", item]);
            }
            if (pendingData.length >= adjustBuffer) {
                availableProducers.push(producer);
            }
            else {
                producer.postMessage(["produce"]);
            }
        }
        function consumerAvailable(consumer) {
            consumer.onmessage = mHandler;
            if (pendingData.length == 0) {
                availableConsumers.push(consumer);
                tryExit();
            }
            else {
                var data = pendingData.pop();
                consumer.postMessage(["consume", data]);
                if (!(availableProducers.length == 0)) {
                    var producer = availableProducers.pop();
                    producer.postMessage(["produce"]);
                }
            }
        }
        function producerStopped() {
            producersStopped += 1;
            tryExit();
        }
        function tryExit() {
            if (producersStopped == totalProducers && availableConsumers.length == totalConsumers) {
                self.postMessage(["end"]);
            }
        }
        function link(ref) {
            ref.onmessage = mHandler;
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.data[2], event.data[3]);
                break;
            case "registerConsumer":
                registerConsumer(event.ports[0]);
                break;
            case "newDataProduced":
                newDataProduced(event.ports[0], event.data[1]);
                break;
            case "consumerAvailable":
                consumerAvailable(event.ports[0]);
                break;
            case "producerStopped":
                producerStopped();
                break;
            case "tryExit":
                tryExit();
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
//# sourceMappingURL=ProducerConsumerManager.js.map