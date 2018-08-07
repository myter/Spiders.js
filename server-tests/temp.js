Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
var app = new spiders_1.Application();
class PrintActor extends spiders_1.Actor {
    constructor() {
        super();
        this.someField = "foo";
        this.TestIsolate = TestIsolate;
    }
    test(isol) {
        let x = new this.TestIsolate();
        console.log(isol.toString());
    }
}
class TestIsolate extends spiders_1.SpiderIsolate {
    hello() {
        return "isolate";
    }
    toString() {
        return "TESTISOLATE TO STRING METHOD";
    }
}
let act = app.spawnActor(PrintActor);
let iso = new TestIsolate();
act.test(new TestIsolate());
//# sourceMappingURL=temp.js.map