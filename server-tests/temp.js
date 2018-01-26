Object.defineProperty(exports, "__esModule", { value: true });
const CAPActor_1 = require("../src/Onward/CAPActor");
const Eventual_1 = require("../src/Onward/Eventual");
var spiders = require("../src/spiders");
class TestEventual extends Eventual_1.Eventual {
    constructor() {
        super();
        this.value = 0;
    }
    inc() {
        this.value++;
    }
    dec() {
        this.value--;
    }
}
exports.TestEventual = TestEventual;
class Master extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.ev = new TestEventual();
    }
    sendAndInc(toRef) {
        toRef.getEv(this.ev);
        this.ev.inc();
    }
}
class Slave extends CAPActor_1.CAPActor {
    getEv(anEv) {
        this.ev = anEv;
    }
    test() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.ev.value);
            }, 2000);
        });
    }
}
let app = new spiders.Application();
let slave = app.spawnActor(Slave);
let master = app.spawnActor(Master);
master.sendAndInc(slave);
slave.test().then((v) => {
    console.log("Value = " + v);
});
//# sourceMappingURL=temp.js.map