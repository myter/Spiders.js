/**
 * Created by flo on 25/01/2017.
 */
module.exports = function (self) {
    function mHandler(event) {
        function calc(theta) {
            var sint = Math.sin(theta);
            var res = sint * sint;
        }
        function newMessage() {
            calc(37.2);
            self.postMessage(["actorDone"]);
        }
        switch (event.data[0]) {
            case "newMessage":
                newMessage();
                break;
        }
    }
    self.addEventListener('message', mHandler);
    self.postMessage(["actorInit"]);
};
//# sourceMappingURL=FJCreationActor.js.map