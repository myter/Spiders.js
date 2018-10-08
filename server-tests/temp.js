Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
var app = new spiders_1.Application();
class TestActor extends spiders_1.Actor {
    test(ref) {
        ref.apply();
    }
}
let act = app.spawnActor(TestActor);
act.test(() => { console.log("Worked!!!!"); }).then((res) => {
    console.log("Promise resolved");
});
//# sourceMappingURL=temp.js.map