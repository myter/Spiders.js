Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require('../src/spiders');
class App extends spiders.Application {
    send(actorRef) {
        this.sendtime = Date.now();
        actorRef.receive();
    }
    received(time) {
        this.receiveTime = time;
        console.log("Total time taken : " + (this.receiveTime - this.sendtime));
    }
}
class TActor extends spiders.Actor {
    receive() {
        let receiveTime = Date.now();
        this.parent.received(receiveTime);
    }
}
let a = new App();
let act = a.spawnActor(TActor);
a.send(act);
//# sourceMappingURL=SpiderPerformance.js.map