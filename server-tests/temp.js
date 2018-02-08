Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class App extends spiders_1.Application {
    constructor() {
        super();
        this.libs.setupPSServer();
    }
}
class Act extends spiders_1.Actor {
    init() {
        let psClient = this.libs.setupPSClient();
        let type = new this.libs.PubSubTag("test");
        psClient.publish(5, type);
        psClient.subscribe(type).each((discov) => {
            console.log("got: " + discov);
        });
    }
}
let app = new App();
app.spawnActor(Act);
app.spawnActor(Act);
//# sourceMappingURL=temp.js.map