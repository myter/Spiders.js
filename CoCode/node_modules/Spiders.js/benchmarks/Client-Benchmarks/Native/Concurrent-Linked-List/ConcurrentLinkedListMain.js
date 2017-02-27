const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 25/01/2017.
 */
class NatConcurrentLinkedListBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Concurrent Linked List", "Native Concurrent Linked List cycle completed", "Native Concurrent Linked List completed", "Native Concurrent Linked List scheduled");
        this.actors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandler(event) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.cLinkedListActors + 2) {
                    for (var i in that.actors) {
                        that.actors[i].postMessage(["work"]);
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
        that.masterRef = that.spawnWorker(require('./ConcurrentLinkedListMaster.js'));
        that.masterRef.onmessage = sysHandler;
        that.masterRef.postMessage(["config", benchUtils_1.BenchConfig.cLinkedListActors]);
        that.listRef = that.spawnWorker(require('./ConcurrentLinkedListList.js'));
        that.listRef.onmessage = sysHandler;
        var count = benchUtils_1.BenchConfig.cLinkedListActors;
        while (count > 0) {
            var newActor = that.spawnWorker(require('./ConcurrentLinkedListWorker.js'));
            newActor.onmessage = sysHandler;
            that.actors.push(newActor);
            var masChan = new MessageChannel();
            that.masterRef.postMessage(["link"], [masChan.port2]);
            var lisChan = new MessageChannel();
            that.listRef.postMessage(["link"], [lisChan.port2]);
            newActor.postMessage(["linkMaster"], [masChan.port1]);
            newActor.postMessage(["linkList"], [lisChan.port1]);
            newActor.postMessage(["config", benchUtils_1.BenchConfig.cLinkedListWrites, benchUtils_1.BenchConfig.cLinkedListSize, benchUtils_1.BenchConfig.cLinkedListMsgs]);
            count -= 1;
        }
    }
    cleanUp() {
        this.actors.push(this.masterRef);
        this.actors.push(this.listRef);
        this.cleanWorkers(this.actors);
        this.actors = [];
    }
}
exports.NatConcurrentLinkedListBench = NatConcurrentLinkedListBench;
//# sourceMappingURL=ConcurrentLinkedListMain.js.map