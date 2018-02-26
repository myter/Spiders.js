Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class TestActor extends spiders_1.Actor {
    getBuff(b) {
        console.log("got:");
        console.log(b);
    }
    sendBuff() {
        return new Buffer("Wut");
    }
}
let app = new spiders_1.Application();
let act = app.spawnActor(TestActor);
let b = new Buffer("Wut");
act.sendBuff().then((bb) => {
    console.log(b.equals(bb));
    console.log(bb.equals(b));
});
//# sourceMappingURL=temp.js.map