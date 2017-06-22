Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var forks = [];
var totalPhilosophers = 0;
var stoppedPhilosophers = 0;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
var refs = new Map();
var linked = 0;
function mHandle(data) {
    function config(tp) {
        totalPhilosophers = tp;
        for (var i = 0; i < totalPhilosophers; i++) {
            forks[i] = true;
        }
    }
    function hungry(id, philPort) {
        var leftFork = forks[id];
        var rightFork = forks[(id + 1) % forks.length];
        var phil = refs.get(philPort);
        if (leftFork && rightFork) {
            forks[id] = false;
            forks[(id + 1) % forks.length] = false;
            phil.emit(["eating"]);
        }
        else {
            phil.emit(["denied"]);
        }
    }
    function done(id) {
        forks[id] = true;
        forks[(id + 1) % forks.length] = true;
    }
    function philExit() {
        stoppedPhilosophers += 1;
        if (stoppedPhilosophers == totalPhilosophers) {
            socketToMain.emit(["end"]);
        }
    }
    function link(refPort) {
        linked++;
        var ref = new benchUtils_1.ClientBufferSocket(refPort, mHandle);
        refs.set(refPort, ref);
        if (linked == totalPhilosophers) {
            socketToMain.emit(["actorInit"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1]);
            break;
        case "hungry":
            hungry(data[1], data[2]);
            break;
        case "done":
            done(data[1]);
            break;
        case "philExit":
            philExit();
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=DiningPhilosopherWaiter.js.map