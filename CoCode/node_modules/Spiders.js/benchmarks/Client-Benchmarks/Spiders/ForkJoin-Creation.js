const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class ForkJoinActor extends spiders.Actor {
    init() {
        this.parent.actorInit();
    }
    calc(theta) {
        var sint = Math.sin(theta);
        return sint * sint;
    }
    newMessage() {
        this.calc(37.2);
        this.parent.actorDone();
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
        var count = benchUtils_1.BenchConfig.fjCreationActors;
        while (count > 0) {
            var newActor = this.spawnActor(ForkJoinActor);
            this.actors.push(newActor);
            count -= 1;
        }
    }
    checkConfig() {
        var that = this;
        if (this.actorsInitialised == benchUtils_1.BenchConfig.fjCreationActors) {
            that.actorsDone = 0;
            for (var i in this.actors) {
                this.actors[i].newMessage();
            }
        }
    }
    actorInit() {
        this.actorsInitialised += 1;
        this.checkConfig();
    }
    actorDone() {
        this.actorsDone += 1;
        if (this.actorsDone == benchUtils_1.BenchConfig.fjCreationActors) {
            this.bench.stopPromise.resolve();
        }
    }
}
class SpiderForkJoinCreationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Fork Join Creation", "Spiders.js Fork Join Creation cycle completed", "Spiders.js Fork Join Creation completed", "Spiders.js Fork Join Creation scheduled");
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
exports.SpiderForkJoinCreationBench = SpiderForkJoinCreationBench;
//# sourceMappingURL=ForkJoin-Creation.js.map