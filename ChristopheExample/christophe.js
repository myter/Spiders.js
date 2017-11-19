var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
const ServiceMonitor_1 = require("../src/MicroService/ServiceMonitor");
const SubTag_1 = require("../src/PubSub/SubTag");
var spiders = require("../src/spiders");
let monitor = new ServiceMonitor_1.ServiceMonitor();
let aTag = new SubTag_1.PubSubTag("A");
let bTag = new SubTag_1.PubSubTag("B");
class Counter extends spiders.Signal {
    constructor() {
        super();
        this.val = 0;
    }
    inc() {
        this.val++;
    }
}
__decorate([
    spiders.mutator
], Counter.prototype, "inc", null);
class ServiceA extends MicroService_1.MicroService {
    constructor() {
        super();
        this.Counter = Counter;
    }
    start() {
        this.counterSignal = this.newSignal(this.Counter);
        this.publishSignal(this.counterSignal);
        this.updateCounter();
    }
    updateCounter() {
        setTimeout(() => {
            this.counterSignal.inc();
            this.updateCounter();
        }, 2000);
    }
}
class ServiceB extends MicroService_1.MicroService {
    start(importedSignals) {
        this.lift(([counterSignal]) => {
            console.log(counterSignal.val);
        })(importedSignals);
    }
}
monitor.installRService(ServiceA, aTag, [], null);
monitor.installRService(ServiceB, bTag, [aTag], null);
monitor.deploy();
//# sourceMappingURL=christophe.js.map