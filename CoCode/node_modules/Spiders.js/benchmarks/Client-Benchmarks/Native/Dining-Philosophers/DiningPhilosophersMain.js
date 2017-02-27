const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 25/01/2017.
 */
class NatDiningPhilosopherBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Dining Philosophers", "Native Dining Philosophers cycle completed", "Native Dining Philosophers completed", "Native Dining Philosophers scheduled");
        this.philosophers = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(event) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.philosopherActors + 1) {
                    for (var i in that.philosophers) {
                        that.philosophers[i].postMessage(["start"]);
                    }
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
        that.waiterRef = that.spawnWorker(require('./DiningPhilosopherWaiter.js'));
        that.waiterRef.onmessage = sysHandle;
        that.waiterRef.postMessage(["config", benchUtils_1.BenchConfig.philosopherActors]);
        var philCount = benchUtils_1.BenchConfig.philosopherActors - 1;
        while (philCount >= 0) {
            var newPhil = that.spawnWorker(require('./DiningPhilosophersPhilosopher.js'));
            newPhil.onmessage = sysHandle;
            var chan = new MessageChannel();
            that.waiterRef.postMessage(["link"], [chan.port2]);
            newPhil.postMessage(["config", philCount, benchUtils_1.BenchConfig.philosopherEating], [chan.port1]);
            that.philosophers.push(newPhil);
            philCount -= 1;
        }
    }
    cleanUp() {
        this.philosophers.push(this.waiterRef);
        this.cleanWorkers(this.philosophers);
        this.philosophers = [];
    }
}
exports.NatDiningPhilosopherBench = NatDiningPhilosopherBench;
//# sourceMappingURL=DiningPhilosophersMain.js.map