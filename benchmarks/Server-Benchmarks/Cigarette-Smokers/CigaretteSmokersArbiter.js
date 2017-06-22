Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
var totalRounds = 0;
var currentRounds = 0;
var totalSmokers = 0;
var smokers = [];
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(tr, ts) {
        totalRounds = tr;
        totalSmokers = ts;
    }
    function newSmoker(smokerPort) {
        var smoker = new benchUtils_1.ClientBufferSocket(smokerPort, mHandle);
        smokers.push(smoker);
        if (smokers.length == totalSmokers) {
            socketToMain.emit(["actorInit"]);
        }
    }
    function getRandom(upper) {
        return Math.floor(Math.random() * (upper - 0) + 0);
    }
    function pickRandom() {
        var index = getRandom(totalSmokers);
        var time = getRandom(1000);
        smokers[index].emit(["startSmoking", time]);
    }
    function startedSmoking() {
        currentRounds += 1;
        if (currentRounds >= totalRounds) {
            socketToMain.emit(["end"]);
        }
        else {
            pickRandom();
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2]);
            break;
        case "newSmoker":
            newSmoker(data[1]);
            break;
        case "pickRandom":
            pickRandom();
            break;
        case "startedSmoking":
            startedSmoking();
            break;
        default:
            console.log("Unknown message: " + data[0]);
    }
}
//# sourceMappingURL=CigaretteSmokersArbiter.js.map