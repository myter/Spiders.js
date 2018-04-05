Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
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
let a = new App();
let act = a.spawnActorFromFile(__dirname + '/LoadPerformanceActor', "TActor");
a.send(act);
//# sourceMappingURL=LoadPerformanceApp.js.map