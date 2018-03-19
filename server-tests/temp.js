Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class Test extends spiders_1.Actor {
    init() {
        console.log("Actor init");
    }
    getMsg() {
        console.log("ok");
    }
}
class TA extends spiders_1.Application {
    init() {
        console.log("App init");
    }
    test(ref) {
        ref.getMsg();
    }
}
let app = new TA();
let act = app.spawnActor(Test);
app.test(act);
//# sourceMappingURL=temp.js.map