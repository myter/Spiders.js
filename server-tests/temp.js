Object.defineProperty(exports, "__esModule", { value: true });
const CAPActor_1 = require("../src/Onward/CAPActor");
var spiders = require("../src/spiders");
class Actor1 extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.thisDirectory = __dirname;
    }
    share(withRef) {
        let TestEventual = require(this.thisDirectory + "/tempEventual").TestEventual;
        let ev = new TestEventual();
        withRef.get(ev);
        setTimeout(() => {
            console.log(ev.value);
        }, 2000);
    }
}
class Actor2 extends CAPActor_1.CAPActor {
    get(anEv) {
        anEv.dec();
        setTimeout(() => {
            console.log(anEv.value);
        }, 2000);
    }
}
let app = new spiders.Application();
let act1 = app.spawnActor(Actor1);
let act2 = app.spawnActor(Actor2);
act1.share(act2);
//# sourceMappingURL=temp.js.map