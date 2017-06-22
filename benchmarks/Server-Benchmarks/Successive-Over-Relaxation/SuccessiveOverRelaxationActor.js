Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var pos = null;
var value = null;
var color = null;
var nx = null;
var ny = null;
var omega = null;
var sorSource = null;
var peer = null;
//
var x = null;
var y = null;
var omega_over_four = null;
var one_minus_omega = null;
var neighbors = [];
var iter = 0;
var maxIter = 0;
var msgRcv = 0;
var sorActors = [];
var mActors = [];
var receivedVals = 0;
var sum = 0.0;
var expectingStart = true;
var pendingMessages = [];
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
var configDone = false;
function mHandle(data) {
    function calPos(x1, y1) {
        return x1 * ny + y1;
    }
    function calcNeighbors() {
        var result = [];
        if (x > 0 && x < nx - 1 && y > 0 && y < ny - 1) {
            result[0] = calPos(x, y + 1);
            result[1] = calPos(x + 1, y);
            result[2] = calPos(x, y - 1);
            result[3] = calPos(x - 1, y);
        }
        else if ((x == 0 || x == (nx - 1)) && (y == 0 || y == (ny - 1))) {
            if (x == 0) {
                result[0] = calPos(x + 1, y);
            }
            else {
                result[0] = calPos(x - 1, y);
            }
            if (y == 0) {
                result[1] = calPos(x, y + 1);
            }
            else {
                result[1] = calPos(x, y - 1);
            }
        }
        else if ((x == 0 || x == (nx - 1)) || (y == 0 || y == (ny - 1))) {
            if (x == 0 || x == nx - 1) {
                if (x == 0) {
                    result[0] = calPos(x + 1, y);
                }
                else {
                    result[0] = calPos(x - 1, y);
                }
                result[1] = calPos(x, y + 1);
                result[2] = calPos(x, y - 1);
            }
            else {
                if (y == 0) {
                    result[0] = calPos(x, y + 1);
                }
                else {
                    result[0] = calPos(x, y - 1);
                }
                result[1] = calPos(x + 1, y);
                result[2] = calPos(x - 1, y);
            }
        }
        return result;
    }
    function config(p, v, c, nxA, nyA, o, pe, ssPort) {
        configDone = true;
        pos = p;
        value = v;
        color = c;
        nx = nxA;
        ny = nyA;
        omega = o;
        sorSource = new benchUtils_1.ClientBufferSocket(ssPort, mHandle);
        peer = pe;
        //
        x = Math.floor(pos / ny);
        y = pos % ny;
        omega_over_four = 0.25 * omega;
        one_minus_omega = 1.0 - omega;
        neighbors = calcNeighbors();
    }
    function addMActor(pos, mActorPort) {
        mActors[pos] = new benchUtils_1.ClientBufferSocket(mActorPort, mHandle);
    }
    function start(mi) {
        if (configDone) {
            expectingStart = false;
            sorActors = mActors;
            maxIter = mi;
            if (color == 1) {
                for (var i in neighbors) {
                    sorActors[neighbors[i]].emit(["valueMessage", value]);
                }
                iter += 1;
                msgRcv += 1;
            }
            for (var i in pendingMessages) {
                var lam = pendingMessages[i];
                lam();
            }
            pendingMessages = [];
            mActors = [];
        }
        else {
            setTimeout(() => {
                start(mi);
            }, 200);
        }
    }
    function valueMessage(val) {
        if (expectingStart) {
            pendingMessages.push(function () { valueMessage(val); });
        }
        else {
            msgRcv += 1;
            if (iter < maxIter) {
                receivedVals += 1;
                sum += val;
                if (receivedVals == neighbors.length) {
                    value = (omega_over_four * sum) + (one_minus_omega * value);
                    sum = 0.0;
                    receivedVals = 0;
                    for (var i in neighbors) {
                        sorActors[neighbors[i]].emit(["valueMessage", value]);
                    }
                    iter += 1;
                }
                if (iter == maxIter) {
                    sorSource.emit(["resultMessage", x, y, value, msgRcv]);
                    socketToMain.emit(["actorExit"]);
                }
            }
        }
    }
    function link(refPort) {
        new benchUtils_1.ClientBufferSocket(refPort, mHandle);
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8]);
            break;
        case "addMActor":
            addMActor(data[1], data[2]);
            break;
        case "start":
            start(data[1]);
            break;
        case "valueMessage":
            valueMessage(data[1]);
            break;
        case "link":
            link(data[1]);
            break;
        default:
            console.log("Unknown message (Actor): " + data[0]);
    }
}
//# sourceMappingURL=SuccessiveOverRelaxationActor.js.map