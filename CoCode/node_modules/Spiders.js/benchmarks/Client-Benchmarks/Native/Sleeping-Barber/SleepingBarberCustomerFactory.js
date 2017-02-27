/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var totalHaircuts = 0;
    var productionRate = 0;
    var currentHaircuts = 0;
    var roomRef = null;
    var customers = [];
    function mHandle(event) {
        function config(th, pr, room) {
            totalHaircuts = th;
            productionRate = pr;
            roomRef = room;
            roomRef.onmessage = mHandle;
        }
        function newCustomer(customerRef) {
            customers.push(customerRef);
            customerRef.onmessage = mHandle;
            if (customers.length == totalHaircuts) {
                self.postMessage(["actorInit"]);
            }
        }
        function busyWait(limit) {
            for (var i = 0; i < limit; i++) {
                Math.floor(Math.random() * (limit - 0 + 1)) + 0;
            }
        }
        function start() {
            for (var i in customers) {
                var copyChan = new MessageChannel();
                copyChan.port1.onmessage = mHandle;
                //Given that channel ref are transferable we may need to copy some along the way
                customers[i].postMessage(["reLink"], [copyChan.port2]);
                roomRef.postMessage(["customerEnter"], [customers[i]]);
                busyWait(productionRate);
            }
        }
        function returned(customer) {
            roomRef.postMessage(["customerEnter"], [customer]);
        }
        function done() {
            currentHaircuts += 1;
            if (currentHaircuts == totalHaircuts) {
                self.postMessage(["end"]);
            }
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.data[2], event.ports[0]);
                break;
            case "newCustomer":
                newCustomer(event.ports[0]);
                break;
            case "start":
                start();
                break;
            case "returned":
                returned(event.ports[0]);
                break;
            case "done":
                done();
                break;
            case "link":
                link(event.ports[0]);
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=SleepingBarberCustomerFactory.js.map