Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class Isol extends spiders_1.SpiderIsolate {
    constructor() {
        super();
        this.val = 5;
    }
    within() {
        console.log(this["_SPIDER_OBJECT_MIRROR_"]);
    }
}
class Act extends spiders_1.Actor {
    constructor() {
        super();
        this.Isol = Isol;
    }
    test() {
        let i = new this.Isol();
        /*setTimeout(()=>{
            i.within()
        },2000)*/
        return i;
    }
}
let app = new spiders_1.Application();
let act = app.spawnActor(Act);
act.test().then((i) => {
    console.log("got isol back");
    console.log(i.val);
    i.within();
    act.test().then((ii) => {
        console.log("Got isol second time");
        console.log(ii.val);
        i.within();
    });
});
//# sourceMappingURL=temp.js.map