Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
class TActor extends spiders.Actor {
    receive() {
        let receiveTime = Date.now();
        this.parent.received(receiveTime);
    }
}
exports.TActor = TActor;
//# sourceMappingURL=LoadPerformanceActor.js.map