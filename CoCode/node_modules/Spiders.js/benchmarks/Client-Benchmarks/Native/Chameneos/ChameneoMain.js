const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 25/01/2017.
 */
class NatChameneoBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Chameneo", "Native Chameneo cycle completed", "Native Chameneo completed", "Native Chameneo scheduled");
        this.actors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var meetingsToHold = benchUtils_1.BenchConfig.chameneoMeetings;
        var numFaded = 0;
        var sumMeetings = 0;
        var waitingCham = null;
        var that = this;
        function sysHandler(event) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.chameneoActors) {
                    for (var i in that.actors) {
                        that.actors[i].postMessage(["startGame"]);
                    }
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function meetCount(count) {
                numFaded += 1;
                sumMeetings = sumMeetings + count;
                if (numFaded == benchUtils_1.BenchConfig.chameneoActors) {
                    that.stopPromise.resolve();
                }
            }
            function meet(sender, color) {
                if (meetingsToHold > 0) {
                    if (waitingCham == null) {
                        waitingCham = sender;
                    }
                    else {
                        meetingsToHold -= 1;
                        waitingCham.postMessage(["meet", color], [sender]);
                        waitingCham = null;
                    }
                }
                else {
                    sender.postMessage(["exitGame"]);
                }
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "meetCount":
                    meetCount(event.data[1]);
                    break;
                case "meet":
                    meet(event.ports[0], event.data[1]);
                    break;
                default:
                    console.log("Unknown message: " + event.data[0]);
            }
        }
        var count = benchUtils_1.BenchConfig.chameneoActors;
        while (count > 0) {
            var newActor = this.spawnWorker(require('./ChameneoActor.js'));
            newActor.onmessage = sysHandler;
            that.actors.push(newActor);
            count -= 1;
        }
        for (var i = 0; i < that.actors.length; i++) {
            var next = that.actors[i];
            next.postMessage(["config", (i % 3)]);
        }
    }
    cleanUp() {
        this.cleanWorkers(this.actors);
        this.actors = [];
    }
}
exports.NatChameneoBench = NatChameneoBench;
//# sourceMappingURL=ChameneoMain.js.map