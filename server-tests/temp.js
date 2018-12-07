Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
var app = new spiders_1.Application();
class testActor1 extends spiders_1.Actor {
    getAndAccess() {
        return this.libs.remote("127.0.0.1", 8082).then((ref) => {
            return ref.getVal();
        });
    }
}
class testActor2 extends spiders_1.Actor {
    getVal() {
        return 5;
    }
}
app.spawnActor(testActor2, [], 8082);
var actor = app.spawnActor(testActor1);
actor.getAndAccess().then((v) => {
    console.log(v);
});
//# sourceMappingURL=temp.js.map