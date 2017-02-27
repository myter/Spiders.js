const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class Waiter extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.forks = [];
        this.totalPhilosophers = 0;
        this.stoppedPhilosophers = 0;
    }
    config(totalPhilosophers) {
        this.totalPhilosophers = totalPhilosophers;
        for (var i = 0; i < this.totalPhilosophers; i++) {
            this.forks[i] = true;
        }
        this.parent.actorInit();
    }
    hungry(phil, id) {
        var leftFork = this.forks[id];
        var rightFork = this.forks[(id + 1) % this.forks.length];
        if (leftFork && rightFork) {
            this.forks[id] = false;
            this.forks[(id + 1) % this.forks.length] = false;
            phil.eating();
        }
        else {
            phil.denied();
        }
    }
    done(id) {
        this.forks[id] = true;
        this.forks[(id + 1) % this.forks.length] = true;
    }
    philExit() {
        this.stoppedPhilosophers += 1;
        if (this.stoppedPhilosophers == this.totalPhilosophers) {
            this.parent.end();
        }
    }
}
class Philosopher extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.waiterRef = null;
        this.id = null;
        this.totalRounds = null;
        this.doneRounds = 0;
    }
    config(waiterRef, id, totalRounds) {
        this.id = id;
        this.totalRounds = totalRounds;
        this.waiterRef = waiterRef;
        this.parent.actorInit();
    }
    start() {
        this.waiterRef.hungry(this, this.id);
    }
    denied() {
        this.waiterRef.hungry(this, this.id);
    }
    eating() {
        this.doneRounds += 1;
        this.waiterRef.done(this.id);
        if (this.doneRounds == this.totalRounds) {
            this.waiterRef.philExit();
        }
        else {
            this.waiterRef.hungry(this, this.id);
        }
    }
}
class DiningPhilosophersApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.philosophers = [];
        this.bench = bench;
    }
    setup() {
        var waiterRef = this.spawnActor(Waiter);
        waiterRef.config(benchUtils_1.BenchConfig.philosopherActors);
        var philCount = benchUtils_1.BenchConfig.philosopherActors - 1;
        while (philCount >= 0) {
            var newPhil = this.spawnActor(Philosopher);
            newPhil.config(waiterRef, philCount, benchUtils_1.BenchConfig.philosopherEating);
            this.philosophers.push(newPhil);
            philCount -= 1;
        }
    }
    checkConfig() {
        if (this.actorsInitialised == benchUtils_1.BenchConfig.philosopherActors + 1) {
            for (var i in this.philosophers) {
                this.philosophers[i].start();
            }
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
class SpiderDiningPhilosophersBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Dining Philosophers", "Spiders.js Dining Philosophers cycle completed", "Spiders.js Dining Philosophers completed", "Spiders.js Dining Philosophers scheduled");
    }
    runBenchmark() {
        this.diningPhilosophersApp = new DiningPhilosophersApp(this);
        this.diningPhilosophersApp.setup();
    }
    cleanUp() {
        this.diningPhilosophersApp.kill();
        this.diningPhilosophersApp.philosophers = [];
    }
}
exports.SpiderDiningPhilosophersBench = SpiderDiningPhilosophersBench;
//# sourceMappingURL=DiningPhilosophers.js.map