Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
class TestIsolate extends spiders.SpiderIsolate {
    constructor() {
        super();
        this.field = 5;
    }
}
class TestActor extends spiders.Actor {
    constructor() {
        super();
        this.TestIsolate = TestIsolate;
    }
    getIsolate() {
        return new this.TestIsolate();
    }
}
let app = new spiders.Application();
let act = app.spawnActor(TestActor);
act.getIsolate().then((isol) => {
    console.log("Got isol");
    console.log(isol.field);
});
//# sourceMappingURL=temp.js.map