/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    var forks = [];
    var totalPhilosophers = 0;
    var stoppedPhilosophers = 0;
    function mHandle(event) {
        function config(tp) {
            totalPhilosophers = tp;
            for (var i = 0; i < totalPhilosophers; i++) {
                forks[i] = true;
            }
            self.postMessage(["actorInit"]);
        }
        function hungry(phil, id) {
            var leftFork = forks[id];
            var rightFork = forks[(id + 1) % forks.length];
            if (leftFork && rightFork) {
                forks[id] = false;
                forks[(id + 1) % forks.length] = false;
                phil.postMessage(["eating"]);
            }
            else {
                phil.postMessage(["denied"]);
            }
        }
        function done(id) {
            forks[id] = true;
            forks[(id + 1) % forks.length] = true;
        }
        function philExit() {
            stoppedPhilosophers += 1;
            if (stoppedPhilosophers == totalPhilosophers) {
                self.postMessage(["end"]);
            }
        }
        function link(ref) {
            ref.onmessage = mHandle;
        }
        switch (event.data[0]) {
            case "config":
                config(event.data[1]);
                break;
            case "hungry":
                hungry(event.ports[0], event.data[1]);
                break;
            case "done":
                done(event.data[1]);
                break;
            case "philExit":
                philExit();
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
//# sourceMappingURL=DiningPhilosopherWaiter.js.map