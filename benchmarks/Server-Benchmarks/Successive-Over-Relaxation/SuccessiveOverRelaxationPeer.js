Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var omega = null;
var jacobi = null;
var s = null;
var partStart = null;
var matrixPart = null;
var border = [];
var borderPorts = [];
var sorSource = null;
var sorSourcePort = null;
var gTotal = 0.0;
var returned = 0;
var totalMsgRcv = 0;
var expectingBoot = true;
var sorActors = [];
var sorActorsPorts = [];
var sorActorsSpawned = 0;
var sorActorsRec = 0;
var myBorder = null;
var myBorderPorts = null;
var configDone = false;
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(o, j, sA, ps, m, ssPort) {
        configDone = true;
        omega = o;
        jacobi = j;
        s = sA;
        partStart = ps;
        matrixPart = JSON.parse(m);
        sorSource = new benchUtils_1.ClientBufferSocket(ssPort, mHandle);
        sorSourcePort = ssPort;
    }
    function addBorder(pos, borderElementPort) {
        var borderElement = new benchUtils_1.ClientBufferSocket(borderElementPort, mHandle);
        border[pos] = borderElement;
        borderPorts[pos] = borderElementPort;
    }
    function sorActorSpawned(pos, index, indexJ, refPort) {
        sorActorsSpawned += 1;
        var ref = new benchUtils_1.ClientBufferSocket(refPort, mHandle);
        sorActors[pos] = ref;
        sorActorsPorts[pos] = refPort;
        if (indexJ == 1) {
            myBorder[index] = ref;
            myBorderPorts[index] = refPort;
        }
    }
    function boot() {
        if (configDone) {
            expectingBoot = false;
            myBorder = [];
            myBorderPorts = [];
            for (var i = 0; i < s; i++) {
                sorActors[i * (s - partStart + 1)] = border[i];
                sorActorsPorts[i * (s - partStart + 1)] = borderPorts[i];
            }
            function outerLoop(i) {
                if (i < s) {
                    var c = (i + partStart) % 2;
                    function innerLoop(j) {
                        if (j < (s - partStart + 1)) {
                            var pos = i * (s - partStart + 1) + j;
                            c = 1 - c;
                            sorActorsRec += 1;
                            socketToMain.emit(["spawnSorActor", pos, matrixPart[i][j - 1], c, s, s - partStart + 1, omega, true, i, j, myPort]);
                            innerLoop(j + 1);
                        }
                    }
                    innerLoop(1);
                    outerLoop(i + 1);
                }
            }
            outerLoop(0);
            kickStart();
        }
        else {
            setTimeout(() => {
                boot();
            }, 200);
        }
    }
    function kickStart() {
        if (sorActorsSpawned == sorActorsRec && sorSource != null && sorActorsSpawned != 0) {
            for (var i = 0; i < s; i++) {
                for (var j = 1; j < (s - partStart + 1); j++) {
                    var pos = i * (s - partStart + 1) + j;
                    for (var z in sorActors) {
                        if (sorActors[z] != null) {
                            sorActors[z].emit(["link", sorActorsPorts[pos]]);
                            sorActors[pos].emit(["addMActor", z, sorActorsPorts[z]]);
                        }
                    }
                    sorActors[pos].emit(["start", jacobi]);
                }
            }
            for (var k in myBorder) {
                if (myBorder[k] != null) {
                    myBorder[k].emit(["link", sorSourcePort]);
                    sorSource.emit(["addBorder", k, myBorderPorts[k]]);
                }
            }
            sorSource.emit(["borderMessage"]);
        }
        else {
            setTimeout(function () {
                kickStart();
            }, 200);
        }
    }
    function resultMessage(mx, my, mv, msgRcv) {
        totalMsgRcv += msgRcv;
        returned += 1;
        gTotal += mv;
        if (returned == s * (s - partStart)) {
            sorSource.emit(["resultMessage", -1, -1, gTotal, totalMsgRcv]);
            socketToMain.emit(["actorExit"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3], data[4], data[5], data[6]);
            break;
        case "addBorder":
            addBorder(data[1], data[2]);
            break;
        case "sorActorSpawned":
            sorActorSpawned(data[1], data[2], data[3], data[4]);
            break;
        case "boot":
            boot();
            break;
        case "kickStart":
            kickStart();
            break;
        case "resultMessage":
            resultMessage(data[1], data[2], data[3], data[4]);
            break;
        default:
            console.log("Unknown message (Peer): " + data[0]);
    }
}
//# sourceMappingURL=SuccessiveOverRelaxationPeer.js.map