Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../benchUtils");
/**
 * Created by flo on 20/02/2017.
 */
var spiders = require("../../src/spiders");
class Worker extends spiders.Actor {
    //Source from : https://gist.github.com/peterc/5019804
    calculate() {
        var MAX = 100000000;
        var r = 5;
        var points_total = 0;
        var points_inside = 0;
        var res = 0;
        while (1) {
            points_total++;
            var x = Math.random() * r * 2 - r;
            var y = Math.random() * r * 2 - r;
            if (Math.pow(x, 2) + Math.pow(y, 2) < Math.pow(r, 2))
                points_inside++;
            if (points_total % MAX == 0) {
                res = (4 * points_inside / points_total);
                break;
            }
        }
        this.parent.workerDone();
    }
}
class SpiderCarloApp extends spiders.Application {
    constructor(bench) {
        super();
        this.workersDone = 0;
        this.bench = bench;
    }
    workerDone() {
        this.workersDone++;
        if (this.workersDone == benchUtils_1.BenchConfig.monteCarloWorkers) {
            this.bench.stopPromise.resolve();
        }
    }
    setup() {
        for (var i = 0; i < benchUtils_1.BenchConfig.monteCarloWorkers; i++) {
            let act = this.spawnActor(Worker);
            act.calculate();
        }
    }
}
class SpiderCarloBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spider Monte Carlo", "Spider Monte Carlo cycle completed", "Spider Monte Carlo completed", "Spider Monte Carlo scheduled");
    }
    runBenchmark() {
        this.app = new SpiderCarloApp(this);
        this.app.setup();
    }
    cleanUp() {
        this.app.kill();
    }
}
exports.SpiderCarloBench = SpiderCarloBench;
//# sourceMappingURL=SpiderCarlo.js.map