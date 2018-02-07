Object.defineProperty(exports, "__esModule", { value: true });
const spiders_js_1 = require("spiders.js");
class MyApplication extends spiders_js_1.Application {
    rcvMsg(msg) {
        console.log(msg);
    }
}
class MyActor extends spiders_js_1.Actor {
    init() {
        console.log("Actor online");
        this.parent.rcvMsg("Hello from actor");
    }
}
let app = new MyApplication();
app.spawnActor(MyActor);
//# sourceMappingURL=main.js.map