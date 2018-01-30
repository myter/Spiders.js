Object.defineProperty(exports, "__esModule", { value: true });
const Available_1 = require("../src/Onward/Available");
var spiders = require("../src/spiders");
class TestAvailable extends Available_1.Available {
    constructor() {
        super();
        this.someVal = 5;
    }
}
class Act extends spiders.Actor {
    constructor() {
        super();
        this.thisDir = __dirname;
        this.av = new TestAvailable();
        this.TestAvailable = TestAvailable;
    }
    test() {
        let av = new this.TestAvailable();
        //av.someVal = 111
        return av.someVal;
    }
}
let app = new spiders.Application();
app.spawnActor(Act).test().then((v) => {
    console.log("Got back:  " + v);
});
//# sourceMappingURL=temp.js.map