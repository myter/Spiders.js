const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 25/01/2017.
 */
class NatSleepingBarberBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Sleeping Barber", "Native Sleeping Barber cycle completed", "Native Sleeping Barber completed", "Native Sleeping Barber scheduled");
        this.customers = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(event) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.barberNrHaircuts + 3) {
                    that.customerFactoryRef.postMessage(["start"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                default:
                    console.log("Unknown message: " + event.data[0]);
            }
        }
        that.barberRef = that.spawnWorker(require('./SleepingBarberBarber.js'));
        that.barberRef.onmessage = sysHandle;
        that.barberRef.postMessage(["config", benchUtils_1.BenchConfig.barberHaircut]);
        that.waitingRoomRef = that.spawnWorker(require('./SleepingBarberWaitingRoom.js'));
        that.waitingRoomRef.onmessage = sysHandle;
        var barChan = new MessageChannel();
        that.waitingRoomRef.postMessage(["config", benchUtils_1.BenchConfig.barberWaitingRoom], [barChan.port1]);
        that.barberRef.postMessage(["linkRoom"], [barChan.port2]);
        that.customerFactoryRef = that.spawnWorker(require('./SleepingBarberCustomerFactory.js'));
        that.customerFactoryRef.onmessage = sysHandle;
        var custChan = new MessageChannel();
        that.waitingRoomRef.postMessage(["link"], [custChan.port1]);
        that.customerFactoryRef.postMessage(["config", benchUtils_1.BenchConfig.barberNrHaircuts, benchUtils_1.BenchConfig.barberProduction], [custChan.port2]);
        var custCount = benchUtils_1.BenchConfig.barberNrHaircuts - 1;
        while (custCount >= 0) {
            var newCust = that.spawnWorker(require('./SleepingBarberCustomer.js'));
            newCust.onmessage = sysHandle;
            var custoChan = new MessageChannel();
            newCust.postMessage(["config"], [custoChan.port2]);
            that.customerFactoryRef.postMessage(["newCustomer"], [custoChan.port1]);
            that.customers.push(newCust);
            custCount -= 1;
        }
    }
    cleanUp() {
        this.customers.push(this.barberRef);
        this.customers.push(this.customerFactoryRef);
        this.customers.push(this.waitingRoomRef);
        this.cleanWorkers(this.customers);
        this.customers = [];
    }
}
exports.NatSleepingBarberBench = NatSleepingBarberBench;
//# sourceMappingURL=SleepingBarberMain.js.map