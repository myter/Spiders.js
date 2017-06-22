Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 13/02/2017.
 */
var n = null;
var s = null;
var omega = null;
var jacobi = null;
var part = null;
var sorActors = [];
var sorActorPorts = [];
var gTotal = 0.0;
var returned = 0;
var totalMsgRcv = 0;
var expectingBoot = true;
var sorActorsSpawned = 0;
var sorActorsRec = 0;
var mBorder = [];
var mBorderPorts = [];
var myBorder = [];
var myBorderPorts = [];
var myPort = parseInt(process.argv[2]);
new benchUtils_1.ServerBufferSocket(myPort, mHandle);
var socketToMain = new benchUtils_1.ClientBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, mHandle);
function mHandle(data) {
    function config(nA, sA, omegaA, jacobiA) {
        n = nA;
        s = sA;
        omega = omegaA;
        jacobi = jacobiA;
        part = Math.floor(s / 2);
        socketToMain.emit(["actorInit"]);
    }
    function genRandomMatrix(M, N) {
        var A = {};
        for (var i = 0; i < M; i++) {
            A[i] = {};
            for (var j = 0; j < N; j++) {
                A[i][j] = (Math.random() * (100 - 0) + 0) * 1e-6;
            }
        }
        return A;
    }
    function sorActorSpawned(pos, index, indexJ, refPort) {
        var ref = new benchUtils_1.ClientBufferSocket(refPort, mHandle);
        sorActors[pos] = ref;
        sorActorPorts[pos] = refPort;
        sorActorsRec += 1;
        if (indexJ == (part - 1)) {
            myBorder[index] = ref;
            myBorderPorts[index] = refPort;
        }
    }
    function boot() {
        myBorder = [];
        var randoms = genRandomMatrix(s, s);
        function outerLoop(i) {
            if (i < s) {
                var c = i % 2;
                function innerLoop(j) {
                    if (j < part) {
                        var pos = i * (part + 1) + j;
                        c = 1 - c;
                        socketToMain.emit(["spawnSorActor", pos, randoms[i][j], c, s, part + 1, omega, false, i, j, myPort]);
                        sorActorsSpawned += 1;
                        innerLoop(j + 1);
                    }
                }
                innerLoop(0);
                outerLoop(i + 1);
            }
        }
        outerLoop(0);
        var partialMatrix = {};
        for (var i = 0; i < s; i++) {
            partialMatrix[i] = {};
            for (var j = 0; j < s - part; j++) {
                partialMatrix[i][j] = randoms[i][j + part];
            }
        }
        var isolMatrix = JSON.stringify(partialMatrix);
        function waitForBorder() {
            if (sorActorsSpawned == sorActorsRec) {
                socketToMain.emit(["spawnSorPeer", s, part, isolMatrix, myPort]);
            }
            else {
                setTimeout(function () {
                    waitForBorder();
                }, 200);
            }
        }
        waitForBorder();
    }
    function sorPeerSpawned(refPort) {
        var ref = new benchUtils_1.ClientBufferSocket(refPort, mHandle);
        for (var i in myBorder) {
            if (myBorder[i] != null) {
                myBorder[i].emit(["link", refPort]);
                ref.emit(["addBorder", i, myBorderPorts[i]]);
            }
        }
        ref.emit(["boot"]);
    }
    function addBorder(pos, borderPort) {
        var border = new benchUtils_1.ClientBufferSocket(borderPort, mHandle);
        mBorder[pos] = border;
        mBorderPorts[pos] = borderPort;
    }
    function borderMessage() {
        if (sorActorsSpawned == sorActorsRec) {
            for (var i = 0; i < s; i++) {
                sorActors[(i + 1) * (part + 1) - 1] = mBorder[i];
                sorActorPorts[(i + 1) * (part + 1) - 1] = mBorderPorts[i];
            }
            for (var i = 0; i < s; i++) {
                for (var j = 0; j < part; j++) {
                    var pos = i * (part + 1) + j;
                    for (var z in sorActors) {
                        if (sorActors[z] != null) {
                            sorActors[pos].emit(["addMActor", z, sorActorPorts[z]]);
                            sorActors[z].emit(["link", sorActorPorts[pos]]);
                        }
                    }
                    sorActors[pos].emit(["start", jacobi]);
                }
            }
        }
        else {
            setTimeout(function () {
                borderMessage();
            }, 200);
        }
    }
    function resultMessage(mx, my, mv, msgRcv) {
        totalMsgRcv += msgRcv;
        returned += 1;
        gTotal += mv;
        if (returned == (s * part) + 1) {
            socketToMain.emit(["actorExit"]);
        }
    }
    switch (data[0]) {
        case "config":
            config(data[1], data[2], data[3], data[4]);
            break;
        case "sorActorSpawned":
            sorActorSpawned(data[1], data[2], data[3], data[4]);
            break;
        case "boot":
            boot();
            break;
        case "sorPeerSpawned":
            sorPeerSpawned(data[1]);
            break;
        case "addBorder":
            addBorder(data[1], data[2]);
            break;
        case "borderMessage":
            borderMessage();
            break;
        case "resultMessage":
            resultMessage(data[1], data[2], data[3], data[4]);
            break;
        default:
            console.log("Unknown message (Runner): " + data[0]);
    }
}
//# sourceMappingURL=SuccessiveOverRelaxationRunner.js.map