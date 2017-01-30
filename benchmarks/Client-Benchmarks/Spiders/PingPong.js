const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 30/01/2017.
 */
var spiders = require("../../../src/spiders");
class PingPongApp extends spiders.Application {
    constructor(bench) {
        super();
        this.pingInitialised = false;
        this.pongInitialised = false;
        this.bench = bench;
    }
    checkConfig() {
        if (this.pingInitialised && this.pongInitialised) {
            this.pingRef.start();
        }
    }
    pingInit() {
        this.pingInitialised = true;
        this.checkConfig();
    }
    pongInit() {
        this.pongInitialised = true;
        this.checkConfig();
    }
    pingsExhausted() {
        this.bench.stopPromise.resolve();
    }
}
class PingActor extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.totalPings = null;
        this.pingsLeft = null;
        this.pongRef = null;
    }
    config(amPings, pongRef) {
        this.totalPings = amPings;
        this.pingsLeft = amPings;
        this.pongRef = pongRef;
        this.parent.pingInit();
    }
    start() {
        this.pingsLeft = this.totalPings;
        this.pongRef.ping();
        this.pingsLeft -= 1;
    }
    pong() {
        if (this.pingsLeft == 0) {
            this.parent.pingsExhausted();
        }
        else {
            this.pingsLeft -= 1;
            this.pongRef.ping();
        }
    }
}
class PongActor extends spiders.Actor {
    constructor() {
        super(...arguments);
        this.pingRef = null;
    }
    config(pingRef) {
        this.pingRef = pingRef;
        this.parent.pongInit();
    }
    ping() {
        this.pingRef.pong();
    }
}
class SpiderPinPongBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Spiders.js Ping Pong", "Spiders.js Ping Pong cycle completed", "Spiders.js Ping Pong completed", "Spiders.js Ping Pong scheduled");
    }
    runBenchmark() {
        this.pingPongApp = new PingPongApp(this);
        var pongRef = this.pingPongApp.spawnActor(PongActor);
        var pingRef = this.pingPongApp.spawnActor(PingActor);
        this.pingPongApp.pingRef = pingRef;
        pingRef.config(benchUtils_1.BenchConfig.pingAmount, pongRef);
        pongRef.config(pingRef);
    }
    cleanUp() {
        this.pingPongApp.kill();
    }
}
exports.SpiderPinPongBench = SpiderPinPongBench;
//# sourceMappingURL=PingPong.js.map