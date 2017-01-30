const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class Smoker extends spiders.Actor {
    config(arbiterRef) {
        this.arbiterRef = arbiterRef;
        this.parent.actorInit();
    }
    busyWait(limit) {
        for (var i = 0; i < limit; i++) {
            Math.floor(Math.random() * (limit - 0 + 1)) + 0;
        }
    }
    startSmoking(time) {
        this.arbiterRef.startedSmoking();
        this.busyWait(time);
    }
}
class Arbiter extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.totalRounds = 0;
        this.currentRounds = 0;
        this.totalSmokers = 0;
        this.smokers = [];
    }
    config(totalRounds, totalSmokers) {
        this.totalRounds = totalRounds;
        this.totalSmokers = totalSmokers;
    }
    newSmoker(smokerRef) {
        this.smokers.push(smokerRef);
        if (this.smokers.length == this.totalSmokers) {
            this.parent.actorInit();
        }
    }
    getRandom(upper) {
        return Math.floor(Math.random() * (upper - 0) + 0);
    }
    pickRandom() {
        var index = this.getRandom(this.totalSmokers);
        var time = this.getRandom(1000);
        this.smokers[index].startSmoking(time);
    }
    startedSmoking() {
        this.currentRounds += 1;
        if (this.currentRounds >= this.totalRounds) {
            this.parent.end();
        }
        else {
            this.pickRandom();
        }
    }
}
class CigaretteSmokersApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.bench = bench;
    }
    setup() {
        this.arbiterRef = this.spawnActor(Arbiter);
        this.arbiterRef.config(benchUtils_1.BenchConfig.cigSmokeRounds, benchUtils_1.BenchConfig.cigSmokeSmokers);
        var smokCount = benchUtils_1.BenchConfig.cigSmokeSmokers - 1;
        while (smokCount >= 0) {
            var newSmok = this.spawnActor(Smoker);
            newSmok.config(this.arbiterRef);
            this.arbiterRef.newSmoker(newSmok);
            smokCount -= 1;
        }
    }
    checkConfig() {
        if (this.actorsInitialised == benchUtils_1.BenchConfig.cigSmokeSmokers + 1) {
            this.arbiterRef.pickRandom();
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
class SpiderCigaretteSmokersBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders. Cigarette Smokers", "Spiders. Cigarette Smokers cycle completed", "Spiders. Cigarette Smokers completed", "Spiders. Cigarette Smokers scheduled");
    }
    runBenchmark() {
        this.cigaretteSmokersApp = new CigaretteSmokersApp(this);
        this.cigaretteSmokersApp.setup();
    }
    cleanUp() {
        this.cigaretteSmokersApp.kill();
    }
}
exports.SpiderCigaretteSmokersBench = SpiderCigaretteSmokersBench;
//# sourceMappingURL=CigaretteSmokers.js.map