Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
var app = new spiders_1.Application();
class TestActor extends spiders_1.Actor {
    test() {
        var waitTill = new Date(new Date().getTime() + 50 * 1000);
        while (waitTill > new Date()) {
            let n = (waitTill.getTime() - new Date().getTime()) / 1000;
            if (!((n - Math.floor(n)) !== 0)) {
                console.log("Seconds left: " + n);
            }
        }
        console.log("test finished");
    }
}
let act = app.spawnActor(TestActor);
act.test().then((res) => {
    console.log("Promise resolved");
});
//# sourceMappingURL=temp.js.map