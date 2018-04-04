Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class TestActor extends spiders_1.Actor {
    foo() {
        console.log("Foo invoked");
        return true;
    }
    bar() {
        return undefined;
    }
}
class TestApp extends spiders_1.Application {
}
let app = new TestApp();
let act = app.spawnActor(TestActor);
act.foo().then((something) => {
    console.log("got result");
});
//# sourceMappingURL=temp.js.map