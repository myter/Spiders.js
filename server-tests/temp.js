Object.defineProperty(exports, "__esModule", { value: true });
const CAPActor_1 = require("../src/Onward/CAPActor");
var spiders = require("../src/spiders");
class Actor1 extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.thisDirectory = __dirname;
    }
    init() {
        let TestEventual = require(this.thisDirectory + "/tempEventual").TestEventual;
        let ev = new TestEventual();
    }
}
class Actor2 extends CAPActor_1.CAPActor {
}
let app = new spiders.Application();
let act1 = app.spawnActor(Actor1);
let act2 = app.spawnActor(Actor2);
//# sourceMappingURL=temp.js.map