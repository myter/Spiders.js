Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class TestMirror extends spiders_1.SpiderObjectMirror {
}
class TestObject extends spiders_1.SpiderObject {
    constructor() {
        super(new TestMirror());
    }
}
//# sourceMappingURL=temp.js.map