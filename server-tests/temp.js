var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
const spiders_1 = require("../src/spiders");
let foo = utils_1.makeMethodAnnotation((mirr) => { console.log("annot triggered"); });
class Test extends spiders_1.SpiderIsolate {
    meth() {
        console.log("Original called");
    }
}
__decorate([
    foo
], Test.prototype, "meth", null);
class App extends spiders_1.Application {
    send() {
        let t = new Test();
        console.log("Invoking in app");
        t.meth();
        act.getIsol(t);
    }
}
class Act extends spiders_1.Actor {
    getIsol(i) {
        console.log("Invoking in Actor");
        i.meth();
    }
}
let app = new App();
let act = app.spawnActor(Act);
app.send();
//# sourceMappingURL=temp.js.map