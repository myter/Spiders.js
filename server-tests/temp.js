Object.defineProperty(exports, "__esModule", { value: true });
const Available_1 = require("../src/Onward/Available");
const utils_1 = require("../src/utils");
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
        console.log("before");
        console.log(Available_1.Available[utils_1.LexScope._LEX_SCOPE_KEY_]);
        this.av = new TestAvailable();
        console.log("after");
        console.log(Available_1.Available[utils_1.LexScope._LEX_SCOPE_KEY_]);
        this.TestAvailable = TestAvailable;
    }
    test() {
        /*let TestAvailable = require(this.thisDir + "/test").TestAvailable
        console.log("before")
        console.log(TestAvailable[LexScope._LEX_SCOPE_KEY_])
        console.log(TestAvailable[LexScope._LEX_SCOPE_KEY_].scopeObjects.get("AvailableMirror"))
        let av = new TestAvailable()
        console.log("after")
        console.log(TestAvailable[LexScope._LEX_SCOPE_KEY_])
        console.log(TestAvailable[LexScope._LEX_SCOPE_KEY_].scopeObjects.get("AvailableMirror"))
        return av.someVal*/
        let av = new this.TestAvailable();
        return av.someVal;
    }
}
let app = new spiders.Application();
app.spawnActor(Act).test().then((v) => {
    console.log("Got back:  " + v);
});
//# sourceMappingURL=temp.js.map