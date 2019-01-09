Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class Test extends spiders_1.SpiderIsolate {
    constructor() {
        super();
        this.val = 6;
    }
    toString() {
        return "{val = " + this.val + "}";
    }
}
class TestActor extends spiders_1.Actor {
    getIsol(i) {
        console.log("Inside Actor : " + i.toString());
    }
}
let app = new spiders_1.Application();
let act = app.spawnActor(TestActor);
let iso = new Test();
act.getIsol(iso);
//# sourceMappingURL=temp.js.map