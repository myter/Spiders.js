Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
//var spiders = require('spiders.js')
class TestApplication extends spiders_1.Application {
}
class TestActor extends spiders_1.Actor {
    init() {
        console.log("Actor has been initialised!!");
    }
}
let app = new spiders_1.Application();
app.spawnActor(TestActor);
//# sourceMappingURL=temp.js.map