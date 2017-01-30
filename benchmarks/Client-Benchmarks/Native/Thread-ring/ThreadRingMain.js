const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 25/01/2017.
 */
class NatThreadRing extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Thread Ring", "Native Thread Ring cycle completed", "Native Thread Ring completed", "Native Thread Ring scheduled");
        this.actors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandler(event) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.threadRingActors) {
                    that.actors[0].postMessage(["ping", benchUtils_1.BenchConfig.threadRingPings]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function traversalDone() {
                that.stopPromise.resolve();
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "traversalDone":
                    traversalDone();
                    break;
            }
        }
        var count = benchUtils_1.BenchConfig.threadRingActors;
        while (count > 0) {
            var newActor = this.spawnWorker(require('./ThreadRingActor.js'));
            newActor.onmessage = sysHandler;
            this.actors.push(newActor);
            count -= 1;
        }
        var index = 0;
        for (var i in this.actors) {
            var next = this.actors[i];
            var neighbour = (index + 1) % benchUtils_1.BenchConfig.threadRingActors;
            var chan = new MessageChannel();
            next.postMessage(["neighbour", benchUtils_1.BenchConfig.threadRingActors], [chan.port1]);
            this.actors[neighbour].postMessage(["newLink"], [chan.port2]);
            index += 1;
        }
    }
    cleanUp() {
        this.cleanWorkers(this.actors);
        this.actors = [];
    }
}
exports.NatThreadRing = NatThreadRing;
//# sourceMappingURL=ThreadRingMain.js.map