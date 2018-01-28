Object.defineProperty(exports, "__esModule", { value: true });
const CAPActor_1 = require("../src/Onward/CAPActor");
const Eventual_1 = require("../src/Onward/Eventual");
const Available_1 = require("../src/Onward/Available");
var spiders = require("../src/spiders");
let app = new spiders.Application();
class TestAvailable extends Available_1.Available {
    constructor() {
        super();
        this.value = 5;
    }
    incWithPrim(num) {
        this.value += num;
    }
    incWithCon(con) {
        this.value += con.value;
    }
}
class TestEventual extends Eventual_1.Eventual {
    constructor() {
        super();
        this.value = 5;
    }
}
class Act extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
        this.TestEventual = TestEventual;
    }
    test() {
        let c = new this.TestConsistent();
        let cc = new this.TestEventual();
        c.incWithCon(cc);
        return c.value;
    }
}
app.spawnActor(Act).test().then((v) => {
    console.log(v);
});
//# sourceMappingURL=temp.js.map