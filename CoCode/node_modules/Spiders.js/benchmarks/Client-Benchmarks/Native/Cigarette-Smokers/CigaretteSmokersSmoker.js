/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var arbiterRef = null;
    function mHandle(event) {
        function config(arbiter) {
            arbiterRef = arbiter;
            arbiterRef.onmessage = mHandle;
            self.postMessage(["actorInit"]);
        }
        function busyWait(limit) {
            for (var i = 0; i < limit; i++) {
                Math.floor(Math.random() * (limit - 0 + 1)) + 0;
            }
        }
        function startSmoking(time) {
            arbiterRef.postMessage(["startedSmoking"]);
            busyWait(time);
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        switch (event.data[0]) {
            case "config":
                config(event.ports[0]);
                break;
            case "startSmoking":
                startSmoking(event.data[1]);
                break;
            case "link":
                link(event.ports[0]);
                break;
            default:
                console.log("Unknown message: " + event.data[0]);
        }
    }
    self.addEventListener('message', mHandle);
};
//# sourceMappingURL=CigaretteSmokersSmoker.js.map