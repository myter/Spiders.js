const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class Customer extends spiders.Actor {
    config(factoryRef) {
        this.factoryRef = factoryRef;
        this.parent.actorInit();
    }
    roomFull() {
        this.factoryRef.back(this);
    }
    done() {
        this.factoryRef.done();
    }
}
class CustomerFactory extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.totalHaircuts = 0;
        this.productionRate = 0;
        this.currentHaircuts = 0;
        this.roomRef = null;
        this.customers = [];
    }
    config(roomRef, totalHaircuts, productionRate) {
        this.totalHaircuts = totalHaircuts;
        this.productionRate = productionRate;
        this.roomRef = roomRef;
    }
    newCustomer(customerRef) {
        this.customers.push(customerRef);
        if (this.customers.length == this.totalHaircuts) {
            this.parent.actorInit();
        }
    }
    busyWait(limit) {
        for (var i = 0; i < limit; i++) {
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }
    start() {
        this.customers.forEach((customer) => {
            this.roomRef.customerEnter(customer);
            this.busyWait(this.productionRate);
        });
    }
    back(customer) {
        this.roomRef.customerEnter(customer);
    }
    done() {
        this.currentHaircuts += 1;
        if (this.currentHaircuts == this.totalHaircuts) {
            this.parent.end();
        }
    }
}
class Barber extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.haircutRate = null;
    }
    config(haircutRate) {
        this.haircutRate = haircutRate;
        this.parent.actorInit();
    }
    busyWait(limit) {
        for (var i = 0; i < limit; i++) {
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }
    newCustomer(customer, room) {
        this.busyWait(this.haircutRate);
        customer.done();
        room.nextCustomer();
    }
}
class WaitingRoom extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.capacity = 0;
        this.waiting = [];
        this.barberRef = null;
        this.barberSleep = true;
    }
    config(barberRef, capacity) {
        this.capacity = capacity;
        this.barberRef = barberRef;
        this.parent.actorInit();
    }
    customerEnter(customerRef) {
        if (this.waiting.length == this.capacity) {
            customerRef.roomFull();
        }
        else {
            this.waiting.push(customerRef);
            if (this.barberSleep) {
                this.barberSleep = false;
                this.nextCustomer();
            }
        }
    }
    nextCustomer() {
        if (this.waiting.length > 0) {
            var customer = this.waiting.pop();
            this.barberRef.newCustomer(customer, this);
        }
        else {
            this.barberSleep = true;
        }
    }
}
class SleepingBarberApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.customers = [];
        this.bench = bench;
    }
    setup() {
        var barberRef = this.spawnActor(Barber);
        barberRef.config(benchUtils_1.BenchConfig.barberHaircut);
        var waitingRoomRef = this.spawnActor(WaitingRoom);
        waitingRoomRef.config(barberRef, benchUtils_1.BenchConfig.barberWaitingRoom);
        this.customerFactoryRef = this.spawnActor(CustomerFactory);
        this.customerFactoryRef.config(waitingRoomRef, benchUtils_1.BenchConfig.barberNrHaircuts, benchUtils_1.BenchConfig.barberProduction);
        var custCount = benchUtils_1.BenchConfig.barberNrHaircuts - 1;
        while (custCount >= 0) {
            var newCust = this.spawnActor(Customer);
            newCust.config(this.customerFactoryRef);
            this.customerFactoryRef.newCustomer(newCust);
            this.customers.push(newCust);
            custCount -= 1;
        }
    }
    checkConfig() {
        if (this.actorsInitialised == benchUtils_1.BenchConfig.barberNrHaircuts + 3) {
            this.customerFactoryRef.start();
        }
    }
    actorInit() {
        this.actorsInitialised += 1;
        this.checkConfig();
    }
    end() {
        this.bench.stopPromise.resolve();
    }
}
class SpiderSleepingBarberBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Sleeping Barber", "Spiders.js Sleeping Barber cycle completed", "Spiders.js Sleeping Barber completed", "Spiders.js Sleeping Barber scheduled");
    }
    runBenchmark() {
        this.sleepingBarberApp = new SleepingBarberApp(this);
        this.sleepingBarberApp.setup();
    }
    cleanUp() {
        this.sleepingBarberApp.kill();
        this.sleepingBarberApp.customers = [];
    }
}
exports.SpiderSleepingBarberBench = SpiderSleepingBarberBench;
//# sourceMappingURL=SleepingBarber.js.map