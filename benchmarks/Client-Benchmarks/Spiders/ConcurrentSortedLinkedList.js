const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class Worker extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.masterRef = null;
        this.listRef = null;
        this.writePercentage = 0;
        this.sizePercentage = 0;
        this.totalMsgs = 0;
        this.currentMsgs = 0;
    }
    init() {
        this.parent.actorInit();
    }
    config(masterRef, listRef, writePercentage, sizePercentage, totalMsgs) {
        this.writePercentage = writePercentage;
        this.sizePercentage = sizePercentage;
        this.totalMsgs = totalMsgs;
        this.masterRef = masterRef;
        this.listRef = listRef;
    }
    getRandom() {
        return Math.floor(Math.random() * (100 - 0 + 1)) + 0;
    }
    work() {
        this.currentMsgs += 1;
        if (this.currentMsgs <= this.totalMsgs) {
            var rand = this.getRandom();
            if (rand < this.sizePercentage) {
                this.listRef.read(this);
            }
            else if (rand < this.writePercentage) {
                var item = this.getRandom();
                this.listRef.write(this, item);
            }
            else {
                var item = this.getRandom();
                this.listRef.cont(this, item);
            }
        }
        else {
            this.masterRef.workerDone();
        }
    }
}
class Master extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.totalWorkers = 0;
        this.workersDone = 0;
    }
    init() {
        this.parent.actorInit();
    }
    config(totalWorkers) {
        this.totalWorkers = totalWorkers;
    }
    workerDone() {
        this.workersDone += 1;
        if (this.workersDone == this.totalWorkers) {
            this.parent.end();
        }
    }
}
class LinkedList extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.listHead = null;
    }
    init() {
        this.parent.actorInit();
    }
    newNode(item) {
        return { item: item, next: null };
    }
    addNode(item) {
        var node = this.newNode(item);
        if (this.listHead == null) {
            this.listHead = node;
        }
        else if (item < this.listHead.item) {
            node.next = this.listHead;
            this.listHead = node;
        }
        else {
            var after = this.listHead.next;
            var before = this.listHead;
            while (after != null) {
                if (item < after.item) {
                    break;
                }
                before = after;
                after = after.next;
            }
            node.next = before.next;
            before.next = node;
        }
    }
    contains(item) {
        var n = this.listHead;
        while (n != null) {
            if (item < n.item) {
                return true;
            }
            n = n.next;
        }
        return false;
    }
    size() {
        var total = 0;
        var n = this.listHead;
        while (n != null) {
            total += 1;
            n = n.next;
        }
        return total;
    }
    read(sender) {
        var length = this.size();
        sender.work();
    }
    write(sender, value) {
        this.addNode(value);
        sender.work();
    }
    cont(sender, value) {
        var res = this.contains(value);
        sender.work();
    }
}
class ConcurrentSortedLinkedListApp extends spiders.Application {
    constructor(bench) {
        super();
        this.actorsInitialised = 0;
        this.actors = [];
        this.bench = bench;
    }
    setup() {
        this.masterRef = this.spawnActor(Master);
        this.masterRef.config(benchUtils_1.BenchConfig.cLinkedListActors);
        this.listRef = this.spawnActor(LinkedList);
        var count = benchUtils_1.BenchConfig.cLinkedListActors;
        while (count > 0) {
            var newActor = this.spawnActor(Worker);
            this.actors.push(newActor);
            count -= 1;
        }
    }
    checkConfig() {
        //+ 2 for dictionary and master
        if (this.actorsInitialised == benchUtils_1.BenchConfig.cLinkedListActors + 2) {
            for (var i in this.actors) {
                this.actors[i].config(this.masterRef, this.listRef, benchUtils_1.BenchConfig.cLinkedListWrites, benchUtils_1.BenchConfig.cLinkedListSize, benchUtils_1.BenchConfig.cLinkedListMsgs);
                this.actors[i].work();
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
class SpiderConcurrentSortedLinkedListBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Concurrent Sorted Linked List", "Spiders.js Concurrent Sorted Linked List cycle completed", "Spiders.js Concurrent Sorted Linked List completed", "Spiders.js Concurrent Sorted Linked List scheduled");
    }
    runBenchmark() {
        this.concurrentSortedLinkedListApp = new ConcurrentSortedLinkedListApp(this);
        this.concurrentSortedLinkedListApp.setup();
    }
    cleanUp() {
        this.concurrentSortedLinkedListApp.kill();
        this.concurrentSortedLinkedListApp.actors = [];
    }
}
exports.SpiderConcurrentSortedLinkedListBench = SpiderConcurrentSortedLinkedListBench;
//# sourceMappingURL=ConcurrentSortedLinkedList.js.map