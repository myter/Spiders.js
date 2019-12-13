Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class TestIsolate extends spiders_1.SpiderIsolate {
    testMirror() {
        console.log(this.mirror);
    }
}
let t = new TestIsolate();
t.testMirror();
//# sourceMappingURL=temp.js.map