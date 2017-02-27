/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var omega = null;
    var jacobi = null;
    var s = null;
    var partStart = null;
    var matrixPart = null;
    var border = null;
    var sorSource = null;
    var gTotal = 0.0;
    var returned = 0;
    var totalMsgRcv = 0;
    var expectingBoot = true;
    var sorActors = [];
    var sorActorsSpawned = 0;
    var sorActorsRec = 0;
    var myBorder = null;
    function mHandle(event) {
        function config(o, j, sA, ps, m, ss) {
            omega = o;
            jacobi = j;
            s = sA;
            partStart = ps;
            matrixPart = JSON.parse(m);
            border = [];
            sorSource = ss;
            sorSource.onmessage = mHandle;
        }
        function addBorder(borderElement, pos) {
            borderElement.onmessage = mHandle;
            border[pos] = borderElement;
        }
        function sorActorSpawned(pos, index, indexJ, ref) {
            ref.onmessage = mHandle;
            sorActors[pos] = ref;
            sorActorsRec += 1;
            if (indexJ == 1) {
                myBorder[index] = ref;
            }
        }
        function boot() {
            expectingBoot = false;
            myBorder = [];
            for (var i = 0; i < s; i++) {
                sorActors[i * (s - partStart + 1)] = border[i];
            }
            function outerLoop(i) {
                if (i < s) {
                    var c = (i + partStart) % 2;
                    function innerLoop(j) {
                        if (j < (s - partStart + 1)) {
                            var pos = i * (s - partStart + 1) + j;
                            c = 1 - c;
                            sorActorsSpawned += 1;
                            var chan = new MessageChannel();
                            chan.port2.onmessage = mHandle;
                            self.postMessage(["spawnSorActor", pos, matrixPart[i][j - 1], c, s, s - partStart + 1, omega, true, i, j], [chan.port1]);
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
        function kickStart() {
            if (sorActorsSpawned == sorActorsRec) {
                for (var i = 0; i < s; i++) {
                    for (var j = 1; j < (s - partStart + 1); j++) {
                        var pos = i * (s - partStart + 1) + j;
                        for (var z in sorActors) {
                            if (sorActors[z] != null) {
                                var chan = new MessageChannel();
                                sorActors[z].postMessage(["link"], [chan.port2]);
                                sorActors[pos].postMessage(["addMActor", z], [chan.port1]);
                            }
                        }
                        sorActors[pos].postMessage(["start", jacobi]);
                    }
                }
                for (var k in myBorder) {
                    if (myBorder[k] != null) {
                        var chan = new MessageChannel();
                        myBorder[k].postMessage(["link"], [chan.port2]);
                        sorSource.postMessage(["addBorder", k], [chan.port1]);
                    }
                }
                sorSource.postMessage(["borderMessage"]);
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
                sorSource.postMessage(["resultMessage", -1, -1, gTotal, totalMsgRcv]);
                self.postMessage(["actorExit"]);
            }
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1], event.data[2], event.data[3], event.data[4], event.data[5], event.ports[0]);
                break;
            case "addBorder":
                addBorder(event.ports[0], event.data[1]);
                break;
            case "sorActorSpawned":
                sorActorSpawned(event.data[1], event.data[2], event.data[3], event.ports[0]);
                break;
            case "boot":
                boot();
                break;
            case "kickStart":
                kickStart();
                break;
            case "resultMessage":
                resultMessage(event.data[1], event.data[2], event.data[3], event.data[4]);
                break;
            default:
                console.log("Unknown message (Peer): " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=SuccessiveOverRelaxationPeer.js.map