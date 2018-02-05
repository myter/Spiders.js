Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class TestAvailable extends spiders_1.SpiderIsolate {
    constructor() {
        super();
        this.someVal = 5;
    }
}
class Act extends spiders_1.Actor {
    constructor() {
        super();
        this.thisDir = __dirname;
        this.av = new TestAvailable();
        this.TestAvailable = TestAvailable;
    }
    test() {
        let av = new this.TestAvailable();
        av.someVal = 555;
        return av.someVal;
    }
}
let app = new spiders_1.Application();
app.spawnActor(Act).test().then((v) => {
    console.log("Got back:  " + v);
});
//# sourceMappingURL=temp.js.map