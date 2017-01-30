/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var capacity = 0;
    var waiting = [];
    var barberRef = null;
    var barberSleep = true;
    function mHandle(event) {
        function config(cap, barber) {
            capacity = cap;
            barberRef = barber;
            barberRef.onmessage = mHandle;
            self.postMessage(["actorInit"]);
        }
        function customerEnter(customerRef) {
            customerRef.onmessage = mHandle;
            if (waiting.length == capacity) {
                customerRef.postMessage(["roomFull"]);
            }
            else {
                waiting.push(customerRef);
                if (barberSleep) {
                    barberSleep = false;
                    nextCustomer();
                }
            }
        }
        function nextCustomer() {
            if (waiting.length > 0) {
                var customer = waiting.pop();
                barberRef.postMessage(["newCustomer"], [customer]);
            }
            else {
                barberSleep = true;
            }
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.ports[0]);
                break;
            case "customerEnter":
                customerEnter(event.ports[0]);
                break;
            case "nextCustomer":
                nextCustomer();
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
//# sourceMappingURL=SleepingBarberWaitingRoom.js.map