Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
class TestApp extends spiders.Application {
    someMethod() {
        console.log("Method invoked");
    }
}
class TestActor extends spiders.Actor {
    init() {
        this.parent.someMethod();
    }
    invokeParent() {
        this.parent.someMethod();
    }
}
let app = new TestApp();
let act = app.spawnActor(TestActor);
//act.invokeParent()
//# sourceMappingURL=temp.js.map