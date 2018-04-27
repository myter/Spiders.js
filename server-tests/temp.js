Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class TestIsol extends spiders_1.SpiderIsolate {
}
class TestMirror extends spiders_1.SpiderActorMirror {
    constructor(someIsol) {
        super();
        this.isol = someIsol;
    }
}
class TestActor extends spiders_1.Actor {
    constructor() {
        super(new TestMirror(new TestIsol()));
    }
}
let app = new spiders_1.Application();
app.spawnActor(TestActor);
//# sourceMappingURL=temp.js.map