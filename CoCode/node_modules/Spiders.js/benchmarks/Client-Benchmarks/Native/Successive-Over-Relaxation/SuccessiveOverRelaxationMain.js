const benchUtils_1 = require("../../../benchUtils");
/**
 * Created by flo on 26/01/2017.
 */
class NatSuccessiveOverRelaxationBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Native Successive Over Relaxation", "Native Successive Over Relaxation cycle completed", "Native Successive Over Relaxation completed", "Native Successive Over Relaxation scheduled");
        this.allSpawned = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var actorsExited = 0;
        var totalSpawned = 1;
        var that = this;
        function sysHandle(event) {
            function checkConfig() {
                if (actorsInitialised == 1) {
                    that.runnerRef.postMessage(["boot"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function actorExit() {
                actorsExited += 1;
                if (actorsExited == totalSpawned) {
                    that.stopPromise.resolve();
                }
            }
            function spawnSorActor(pos, value, color, nx, ny, omega, sorSource, peer, index, indexJ) {
                var actRef = that.spawnWorker(require('./SuccessiveOverRelaxationActor.js'));
                var chan = new MessageChannel();
                sorSource.postMessage(["sorActorSpawned", pos, index, indexJ], [chan.port2]);
                actRef.onmessage = sysHandle;
                that.allSpawned.push(actRef);
                actRef.postMessage(["config", pos, value, color, nx, ny, omega, peer], [chan.port1]);
            }
            function spawnSorPeer(s, partStart, matrix, sorSource) {
                var peerRef = that.spawnWorker(require('./SuccessiveOverRelaxationPeer.js'));
                var chan = new MessageChannel();
                sorSource.postMessage(["sorPeerSpawned"], [chan.port2]);
                peerRef.onmessage = sysHandle;
                that.allSpawned.push(peerRef);
                peerRef.postMessage(["config", benchUtils_1.BenchConfig.sorOmega, benchUtils_1.BenchConfig.sorJacobi, s, partStart, matrix], [chan.port1]);
            }
            switch (event.data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "actorExit":
                    actorExit();
                    break;
                case "spawnSorActor":
                    spawnSorActor(event.data[1], event.data[2], event.data[3], event.data[4], event.data[5], event.data[6], event.ports[0], event.data[7], event.data[8], event.data[9]);
                    break;
                case "spawnSorPeer":
                    spawnSorPeer(event.data[1], event.data[2], event.data[3], event.ports[0]);
                    break;
                default:
                    console.log("Unknown message (System): " + event.data[0]);
            }
        }
        that.runnerRef = that.spawnWorker(require('./SuccessiveOverRelaxationRunner.js'));
        that.runnerRef.onmessage = sysHandle;
        that.runnerRef.postMessage(["config", benchUtils_1.BenchConfig.sorN, benchUtils_1.BenchConfig.sorDataSizes[benchUtils_1.BenchConfig.sorN], benchUtils_1.BenchConfig.sorOmega, benchUtils_1.BenchConfig.sorJacobi]);
    }
    cleanUp() {
        this.allSpawned.push(this.runnerRef);
        this.cleanWorkers(this.allSpawned);
        this.allSpawned = [];
    }
}
exports.NatSuccessiveOverRelaxationBench = NatSuccessiveOverRelaxationBench;
//# sourceMappingURL=SuccessiveOverRelaxationMain.js.map