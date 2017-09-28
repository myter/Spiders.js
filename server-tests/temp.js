var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
class TestSignal extends spiders.Signal {
    set(v) {
        console.log("Setting");
        this.val = v;
    }
}
__decorate([
    spiders.mutator
], TestSignal.prototype, "set", null);
class TestIsolate extends spiders.Isolate {
}
class TestActor extends spiders.Actor {
    constructor() {
        super();
        this.defS = TestSignal;
        this.defI = TestIsolate;
    }
    init() {
        let sig = this.newSignal(this.defS);
        this.lift((v) => {
            console.log("New value : " + v.val);
        })(sig);
        sig.set(5);
    }
}
let app = new spiders.Application();
app.spawnActor(TestActor);
//# sourceMappingURL=temp.js.map