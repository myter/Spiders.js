Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class TestIsol extends spiders_1.SpiderIsolate {
    constructor() {
        super();
        this.value = 5;
    }
}
class TestMirror extends spiders_1.SpiderActorMirror {
    constructor(someIsol) {
        super();
        this.isol = someIsol;
    }
}
class TestActor extends spiders_1.Actor {
    constructor() {
        super();
        this.TestIsol = TestIsol;
    }
    init() {
        let t = new this.TestIsol();
        let tt = this.libs.clone(t);
    }
}
let app = new spiders_1.Application();
app.spawnActor(TestActor);
//# sourceMappingURL=temp.js.map