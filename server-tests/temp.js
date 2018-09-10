Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
var app = new spiders_1.Application();
class TestActor extends spiders_1.Actor {
    test() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject("trying to reject");
            }, 2000);
        });
    }
}
let act = app.spawnActor(TestActor);
console.log(act);
//# sourceMappingURL=temp.js.map