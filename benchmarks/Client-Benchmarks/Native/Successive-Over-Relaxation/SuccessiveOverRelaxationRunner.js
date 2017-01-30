/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var n = null;
    var s = null;
    var omega = null;
    var jacobi = null;
    var part = null;
    var sorActors = [];
    var gTotal = 0.0;
    var returned = 0;
    var totalMsgRcv = 0;
    var expectingBoot = true;
    var sorActorsSpawned = 0;
    var sorActorsRec = 0;
    var mBorder = [];
    var myBorder = [];
    function mHandle(event) {
        function config(nA, sA, omegaA, jacobiA) {
            n = nA;
            s = sA;
            omega = omegaA;
            jacobi = jacobiA;
            part = Math.floor(s / 2);
            self.postMessage(["actorInit"]);
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
        function sorActorSpawned(pos, index, indexJ, ref) {
            ref.onmessage = mHandle;
            sorActors[pos] = ref;
            sorActorsRec += 1;
            if (indexJ == (part - 1)) {
                myBorder[index] = ref;
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
                            var chan = new MessageChannel();
                            chan.port2.onmessage = mHandle;
                            self.postMessage(["spawnSorActor", pos, randoms[i][j], c, s, part + 1, omega, false, i, j], [chan.port1]);
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
                    var chan = new MessageChannel();
                    chan.port2.onmessage = mHandle;
                    self.postMessage(["spawnSorPeer", s, part, isolMatrix], [chan.port1]);
                }
                else {
                    setTimeout(function () {
                        waitForBorder();
                    }, 200);
                }
            }
            waitForBorder();
        }
        function sorPeerSpawned(ref) {
            ref.onmessage = mHandle;
            for (var i in myBorder) {
                if (myBorder[i] != null) {
                    var chan = new MessageChannel();
                    myBorder[i].postMessage(["link"], [chan.port2]);
                    ref.postMessage(["addBorder", i], [chan.port1]);
                }
            }
            ref.postMessage(["boot"]);
        }
        function addBorder(border, pos) {
            border.onmessage = mHandle;
            mBorder[pos] = border;
        }
        function borderMessage() {
            if (sorActorsSpawned == sorActorsRec) {
                for (var i = 0; i < s; i++) {
                    sorActors[(i + 1) * (part + 1) - 1] = mBorder[i];
                }
                for (var i = 0; i < s; i++) {
                    for (var j = 0; j < part; j++) {
                        var pos = i * (part + 1) + j;
                        for (var z in sorActors) {
                            if (sorActors[z] != null) {
                                var chan = new MessageChannel();
                                sorActors[pos].postMessage(["addMActor", z], [chan.port2]);
                                sorActors[z].postMessage(["link"], [chan.port1]);
                            }
                        }
                        sorActors[pos].postMessage(["start", jacobi]);
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
                self.postMessage(["actorExit"]);
            }
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.data[2], event.data[3], event.data[4]);
                break;
            case "sorActorSpawned":
                sorActorSpawned(event.data[1], event.data[2], event.data[3], event.ports[0]);
                break;
            case "boot":
                boot();
                break;
            case "sorPeerSpawned":
                sorPeerSpawned(event.ports[0]);
                break;
            case "addBorder":
                addBorder(event.ports[0], event.data[1]);
                break;
            case "borderMessage":
                borderMessage();
                break;
            case "resultMessage":
                resultMessage(event.data[1], event.data[2], event.data[3], event.data[4]);
                break;
            default:
                console.log("Unknown message (Runner): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=SuccessiveOverRelaxationRunner.js.map