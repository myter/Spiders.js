const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class ForkJoinActor extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.totalAmMess = null;
        this.currentAmMess = null;
    }
    config(amMess) {
        this.totalAmMess = amMess;
        this.currentAmMess = 0;
        this.parent.actorInit();
    }
    calc(theta) {
        var sint = Math.sin(theta);
        return sint * sint;
    }
    newMessage(fresh) {
        if (fresh) {
            this.currentAmMess = 0;
        }
        else {
            this.currentAmMess += 1;
            this.calc(37.2);
            if (this.currentAmMess == this.totalAmMess) {
                this.parent.actorDone();
            }
        }
    }
}
class ForkJoinApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.actorsDone = 0;
        this.actors = [];
        this.bench = bench;
    }
    setup() {
        var count = benchUtils_1.BenchConfig.fjThroughputActors;
        while (count > 0) {
            var actRef = this.spawnActor(ForkJoinActor);
            this.actors.push(actRef);
            actRef.config(benchUtils_1.BenchConfig.fjThroughputMessages);
            count -= 1;
        }
    }
    checkConfig() {
        if (this.actorsInitialised == benchUtils_1.BenchConfig.fjThroughputActors) {
            this.actorsDone = 0;
            for (var i in this.actors) {
                this.actors[i].newMessage(true);
            }
            for (var i in this.actors) {
                var next = this.actors[i];
                for (var j = 0; j < benchUtils_1.BenchConfig.fjThroughputMessages; j++) {
                    next.newMessage(false);
                }
            }
        }
    }
    actorInit() {
        this.actorsInitialised += 1;
        this.checkConfig();
    }
    actorDone() {
        this.actorsDone += 1;
        if (this.actorsDone == benchUtils_1.BenchConfig.fjThroughputActors) {
            this.bench.stopPromise.resolve();
        }
    }
}
class SpiderForkJoinThroughputBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Fork Join Throughput", "Spiders.js Fork Join Throughput cycle completed", "Spiders.js Fork Join Throughput completed", "Spiders.js Fork Join Throughput scheduled");
    }
    runBenchmark() {
        this.forkJoinApp = new ForkJoinApp(this);
        this.forkJoinApp.setup();
    }
    cleanUp() {
        this.forkJoinApp.kill();
        this.forkJoinApp.actors = [];
    }
}
exports.SpiderForkJoinThroughputBench = SpiderForkJoinThroughputBench;
//# sourceMappingURL=ForkJoin-Throughput.js.map