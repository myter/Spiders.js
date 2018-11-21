Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class TestServer extends spiders_1.Application {
    constructor() {
        super();
        this.libs.setupPSServer();
    }
}
let server = new TestServer();
class TestIsolate extends spiders_1.SpiderIsolate {
    constructor(v) {
        super();
        this.val = v;
    }
}
class TestClient extends spiders_1.Actor {
    constructor() {
        super();
        this.TestIsolate = TestIsolate;
    }
    init() {
        this.client = this.libs.setupPSClient();
        this.testTag = new this.libs.PubSubTag("test");
    }
    pub() {
        this.client.publish(new this.TestIsolate(5), this.testTag);
    }
    sub() {
        let resolve;
        let prom = new Promise((res) => {
            resolve = res;
        });
        this.client.subscribe(this.testTag).each((isol) => {
            resolve(isol.val);
        });
        return prom;
    }
}
let puber = server.spawnActor(TestClient);
let suber = server.spawnActor(TestClient);
puber.pub();
suber.sub().then((val) => {
    console.log(val);
});
//# sourceMappingURL=temp.js.map