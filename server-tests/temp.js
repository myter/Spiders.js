Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
var app = new spiders_1.Application();
class testActor1 extends spiders_1.Actor {
    getAndAccess() {
        return new Promise((resolve) => {
            let rem = this.libs.buffRemote("127.0.0.1", 8082);
            let ps = [];
            ps[0] = rem.getVal();
            ps[1] = rem.someVal;
            setTimeout(() => {
                ps[2] = rem.getVal();
                ps[3] = rem.someVal;
                resolve(Promise.all(ps));
            }, 2000);
        });
    }
}
class testActor2 extends spiders_1.Actor {
    constructor() {
        super();
        this.someVal = 6;
    }
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