var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ServiceMonitor_1 = require("../src/MicroService/ServiceMonitor");
const MicroService_1 = require("../src/MicroService/MicroService");
const SubTag_1 = require("../src/PubSub/SubTag");
var spiders = require("../src/spiders");
let monitor = new ServiceMonitor_1.ServiceMonitor("127.0.0.1", 8000);
class TestSignal extends spiders.Signal {
    constructor() {
        super();
        this.value = 1;
    }
    inc() {
        ++this.value;
    }
}
__decorate([
    spiders.mutator
], TestSignal.prototype, "inc", null);
var SourceTag = new SubTag_1.PubSubTag("Source");
var Source2Tag = new SubTag_1.PubSubTag("Source2");
var ATag = new SubTag_1.PubSubTag("A");
var BTag = new SubTag_1.PubSubTag("B");
var SinkTag = new SubTag_1.PubSubTag("Sink");
var SuperTag = new SubTag_1.PubSubTag("Super");
class Source extends MicroService_1.MicroService {
    constructor() {
        super();
        this.TestSignal = TestSignal;
        this.SourceTag = SourceTag;
        this.SinkTag = SinkTag;
    }
    start(subSignal) {
        this.t = this.newSignal(this.TestSignal);
        this.publishSignal(this.t);
        this.update();
    }
    update() {
        setTimeout(() => {
            this.t.inc();
            this.update();
        }, 2000);
    }
}
class Source2 extends MicroService_1.MicroService {
    constructor() {
        super();
        this.TestSignal = TestSignal;
        this.Source2Tag = Source2Tag;
        this.SinkTag = BTag;
    }
    start(subSignal) {
        this.t = this.newSignal(this.TestSignal);
        this.publishSignal(this.t);
        this.update();
    }
    update() {
        setTimeout(() => {
            this.t.inc();
            this.update();
        }, 3000);
    }
}
class A extends MicroService_1.MicroService {
    start(subSignal) {
        let r = this.lift(([v]) => {
            return ++v.value;
        })(subSignal);
        this.publishSignal(r);
    }
}
class B extends MicroService_1.MicroService {
    start(subSignal) {
        let r = this.lift(([v]) => {
            return ++v.value;
        })(subSignal);
        this.publishSignal(r);
    }
}
class Sink extends MicroService_1.MicroService {
    start(subSignal) {
        let x = this.lift((res) => {
            console.log("Got: " + res);
            return res;
        })(subSignal);
        this.publishSignal(x);
    }
}
class SuperSink extends MicroService_1.MicroService {
    start(subSignal) {
        this.lift((res) => {
            console.log("Got SUPER: " + res);
        })(subSignal);
    }
}
monitor.installRService(SuperSink, SuperTag, [SinkTag], null);
monitor.installRService(Sink, SinkTag, [ATag, BTag, Source2Tag], null);
monitor.installRService(Source, SourceTag, [], null);
monitor.installRService(A, ATag, [SourceTag], null);
monitor.installRService(B, BTag, [SourceTag], null);
monitor.deploy();
//# sourceMappingURL=temp2.js.map