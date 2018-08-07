Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
var app = new spiders_1.Application();
class PrintActor extends spiders_1.Actor {
    constructor() {
        super();
        this.someField = "foo";
    }
    someMethod() {
    }
}
let t = app.spawnActor(PrintActor);
console.log(t);
//# sourceMappingURL=temp.js.map