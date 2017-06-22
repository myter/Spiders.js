Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 09/02/2017.
 */
class NodeFilterBankBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Filter Bank", "Node Filter Bank cycle completed", "Node Filter Bank completed", "Node Filter Bank scheduled");
        this.lastPort = 8007;
        this.miscActors = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == 6 + benchUtils_1.BenchConfig.filterBankChannels + benchUtils_1.BenchConfig.filterBankChannels * 6) {
                    that.producerRef.emit(["nextMessage"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                default:
                    console.log("Unknown message (System): " + data[0]);
            }
        }
        that.mainPort = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.producerRef = that.spawnNode("Filter-Bank/FilterBankProducer", sysHandle, NodeFilterBankBench._PRODUCER_PORT_);
        that.sinkRef = that.spawnNode("Filter-Bank/FilterBankSink", sysHandle, NodeFilterBankBench._SINK_PORT_);
        that.combineRef = that.spawnNode("Filter-Bank/FilterBankCombine", sysHandle, NodeFilterBankBench._COMBINE_PORT_);
        that.sinkRef.emit(["link", NodeFilterBankBench._COMBINE_PORT_]);
        that.combineRef.emit(["config", NodeFilterBankBench._SINK_PORT_]);
        that.integrateRef = that.spawnNode("Filter-Bank/FilterBankIntegrator", sysHandle, NodeFilterBankBench._INTEGRATE_PORT_);
        that.combineRef.emit(["link", NodeFilterBankBench._INTEGRATE_PORT_]);
        that.integrateRef.emit(["config", benchUtils_1.BenchConfig.filterBankChannels, NodeFilterBankBench._COMBINE_PORT_]);
        that.branchesRef = that.spawnNode("Filter-Bank/FilterBankBranch", sysHandle, NodeFilterBankBench._BRANCHES_PORT_);
        that.integrateRef.emit(["link", NodeFilterBankBench._BRANCHES_PORT_]);
        that.branchesRef.emit(["config", NodeFilterBankBench._INTEGRATE_PORT_]);
        var H = {};
        var F = {};
        for (var j = 0; j < benchUtils_1.BenchConfig.filterBankChannels; j++) {
            H[j] = {};
            F[j] = {};
            for (var i = 0; i < benchUtils_1.BenchConfig.filterBankColumns; i++) {
                H[j][i] = (1.0 * i * benchUtils_1.BenchConfig.filterBankColumns) + (1.0 * j * benchUtils_1.BenchConfig.filterBankChannels) + j + i + j + 1;
                F[j][i] = (1.0 * i * j) + (1.0 * j * j) + j + i;
            }
        }
        for (var i = 0; i < benchUtils_1.BenchConfig.filterBankChannels; i++) {
            var taggedPort = that.lastPort;
            that.lastPort++;
            var taggedRef = that.spawnNode("Filter-Bank/FilterBankTaggedForward", sysHandle, taggedPort);
            that.miscActors.push(taggedRef);
            that.integrateRef.emit(["link", taggedPort]);
            taggedRef.emit(["config", i, NodeFilterBankBench._INTEGRATE_PORT_]);
            var firFilt2Port = that.lastPort;
            that.lastPort++;
            var firFilt2Ref = that.spawnNode("Filter-Bank/FilterBankFirFilter", sysHandle, firFilt2Port);
            that.miscActors.push(firFilt2Ref);
            taggedRef.emit(["link", firFilt2Port]);
            firFilt2Ref.emit(["config", i + ".2", benchUtils_1.BenchConfig.filterBankColumns, taggedPort]);
            for (var c in F[i]) {
                firFilt2Ref.emit(["newCoef", F[i][c]]);
            }
            firFilt2Ref.emit(["configDone"]);
            var delayPort = that.lastPort;
            that.lastPort++;
            var delayRef = that.spawnNode("Filter-Bank/FilterBankDelay", sysHandle, delayPort);
            that.miscActors.push(delayRef);
            firFilt2Ref.emit(["link", delayPort]);
            delayRef.emit(["config", i + ".2", benchUtils_1.BenchConfig.filterBankColumns - 1, firFilt2Port]);
            var samplePort = that.lastPort;
            that.lastPort++;
            var sampleFiltRef = that.spawnNode("Filter-Bank/FilterBankSampleFilter", sysHandle, samplePort);
            that.miscActors.push(sampleFiltRef);
            delayRef.emit(["link", samplePort]);
            sampleFiltRef.emit(["config", benchUtils_1.BenchConfig.filterBankColumns, delayPort]);
            var firFiltPort = that.lastPort;
            that.lastPort++;
            var firFiltRef = that.spawnNode("Filter-Bank/FilterBankFirFilter", sysHandle, firFiltPort);
            that.miscActors.push(firFiltRef);
            sampleFiltRef.emit(["link", firFiltPort]);
            firFiltRef.emit(["config", i + ".1", benchUtils_1.BenchConfig.filterBankColumns, samplePort]);
            for (var c in H[i]) {
                firFiltRef.emit(["newCoef", H[i][c]]);
            }
            firFiltRef.emit(["configDone"]);
            var firstPort = that.lastPort;
            that.lastPort++;
            var firstRef = that.spawnNode("Filter-Bank/FilterBankDelay", sysHandle, firstPort);
            that.miscActors.push(firstRef);
            firFiltRef.emit(["link", firstPort]);
            firstRef.emit(["config", i + ".1", benchUtils_1.BenchConfig.filterBankColumns - 1, firFiltPort]);
            var bankPort = that.lastPort;
            that.lastPort++;
            var bankRef = that.spawnNode("Filter-Bank/FilterBankBank", sysHandle, bankPort);
            that.miscActors.push(bankRef);
            that.integrateRef.emit(["link", bankPort]);
            firstRef.emit(["link", bankPort]);
            bankRef.emit(["linkFirst", firstPort]);
            bankRef.emit(["config", i, benchUtils_1.BenchConfig.filterBankColumns, NodeFilterBankBench._INTEGRATE_PORT_]);
            bankRef.emit(["link", NodeFilterBankBench._BRANCHES_PORT_]);
            that.branchesRef.emit(["newBank", bankPort]);
        }
        that.branchesRef.emit(["configDone"]);
        that.sourceRef = that.spawnNode("Filter-Bank/FilterBankSource", sysHandle, NodeFilterBankBench._SOURCE_PORT_);
        that.producerRef.emit(["link", NodeFilterBankBench._SOURCE_PORT_]);
        that.sourceRef.emit(["linkProducer", NodeFilterBankBench._PRODUCER_PORT_]);
        that.branchesRef.emit(["link", NodeFilterBankBench._SOURCE_PORT_]);
        that.sourceRef.emit(["linkBranches", NodeFilterBankBench._BRANCHES_PORT_]);
        that.sourceRef.emit(["configDone"]);
        that.sourceRef.emit(["link", NodeFilterBankBench._PRODUCER_PORT_]);
        that.producerRef.emit(["config", benchUtils_1.BenchConfig.filterBankSimulations, NodeFilterBankBench._SOURCE_PORT_]);
    }
    cleanUp() {
        this.cleanNodes();
        this.mainPort.close();
        this.miscActors = [];
    }
}
NodeFilterBankBench._PRODUCER_PORT_ = 8001;
NodeFilterBankBench._SINK_PORT_ = 8002;
NodeFilterBankBench._COMBINE_PORT_ = 8003;
NodeFilterBankBench._INTEGRATE_PORT_ = 8004;
NodeFilterBankBench._BRANCHES_PORT_ = 8005;
NodeFilterBankBench._SOURCE_PORT_ = 8006;
exports.NodeFilterBankBench = NodeFilterBankBench;
//# sourceMappingURL=FilterBankMain.js.map