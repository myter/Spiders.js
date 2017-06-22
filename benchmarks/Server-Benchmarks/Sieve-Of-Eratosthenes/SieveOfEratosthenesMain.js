Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
class NodeSieveOfEratosthenesBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Sieve of Eratosthenes", "Node Sieve of Eratosthenes cycle comples", "Node Sieve of Eratosthenes completed", "Node Sieve of Eratosthenes scheduled");
        this.lastPort = 8003;
        this.spawned = new Map();
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == 2) {
                    that.producerRef.emit(["start"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            function spawnNew(id, initPrime, senderPort) {
                var ref = that.spawnNode("Sieve-Of-Eratosthenes/SieveOfEratosthenesPrimeFilter", sysHandle, that.lastPort);
                that.spawned.set(that.lastPort, ref);
                ref.emit(["config", id, initPrime, benchUtils_1.BenchConfig.sieveLocal]);
                ref.emit(["link", senderPort]);
                var sender = that.spawned.get(senderPort);
                sender.emit(["newSpawned", that.lastPort]);
                that.lastPort++;
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                case "spawnNew":
                    spawnNew(data[1], data[2], data[3]);
                    break;
                default:
                    console.log("Unknown message (System): " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.filterRef = that.spawnNode("Sieve-Of-Eratosthenes/SieveOfEratosthenesPrimeFilter", sysHandle, NodeSieveOfEratosthenesBench._FILTER_PORT_);
        that.filterRef.emit(["config", 1, 2, benchUtils_1.BenchConfig.sieveLocal]);
        that.producerRef = that.spawnNode("Sieve-Of-Eratosthenes/SieveOfEratosthenesProducer", sysHandle, NodeSieveOfEratosthenesBench._PRODUCER_PORT_);
        that.filterRef.emit(["link", NodeSieveOfEratosthenesBench._PRODUCER_PORT_]);
        that.producerRef.emit(["config", benchUtils_1.BenchConfig.sieveLimit, NodeSieveOfEratosthenesBench._FILTER_PORT_]);
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.spawned = new Map();
    }
}
NodeSieveOfEratosthenesBench._PRODUCER_PORT_ = 8001;
NodeSieveOfEratosthenesBench._FILTER_PORT_ = 8002;
exports.NodeSieveOfEratosthenesBench = NodeSieveOfEratosthenesBench;
//# sourceMappingURL=SieveOfEratosthenesMain.js.map