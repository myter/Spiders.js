Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class Test extends spiders_1.Actor {
    init() {
        console.log("Actor init");
    }
}
let app = new spiders_1.Application();
app.spawnActor(Test);
//# sourceMappingURL=temp.js.map