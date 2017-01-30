/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var factoryRef = null;
    function mHandle(event) {
        function config(factory) {
            factoryRef = factory;
            factoryRef.onmessage = mHandle;
            self.postMessage(["actorInit"]);
        }
        function roomFull() {
            var chan = new MessageChannel();
            chan.port2.onmessage = mHandle;
            factoryRef.postMessage(["returned"], [chan.port1]);
        }
        function done() {
            factoryRef.postMessage(["done"]);
        }
        //Given that channel ref are transferable we may need to copy some along the way
        function reLink(ref) {
            factoryRef = ref;
            factoryRef.onmessage = mHandle;
        }
        switch (event.data[0]) {
            case "config":
                config(event.ports[0]);
                break;
            case "roomFull":
                roomFull();
                break;
            case "done":
                done();
                break;
            case "reLink":
                reLink(event.ports[0]);
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=SleepingBarberCustomer.js.map