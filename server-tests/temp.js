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
let monitor = new ServiceMonitor_1.ServiceMonitor();
let sourceTag = new SubTag_1.PubSubTag("source");
let sinkTag = new SubTag_1.PubSubTag("sink");
let aTag = new SubTag_1.PubSubTag("a");
let bTag = new SubTag_1.PubSubTag("b");
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
class SourceService extends MicroService_1.MicroService {
    constructor() {
        super();
        this.sourceTag = sourceTag;
        this.aTag = aTag;
        this.bTag = bTag;
        this.TestSignal = TestSignal;
        this.sinkTag = sinkTag;
    }
    init() {
        this.QPROP(this.sourceTag, [], [this.aTag, this.bTag], null);
        let t = this.newSignal(this.TestSignal);
        this.publishSignal(t);
        setTimeout(() => {
            t.inc();
        }, 3000);
    }
}
class ServiceA extends MicroService_1.MicroService {
    constructor() {
        super();
        this.sourceTag = sourceTag;
        this.sinkTag = sinkTag;
        this.aTag = aTag;
    }
    init() {
        let s = this.QPROP(this.aTag, [this.sourceTag], [this.sinkTag], null);
        let ss = this.lift((sa) => {
            console.log("Got change in A: " + sa[0].value);
            return sa[0].value + 1;
        })(s);
        this.publishSignal(ss);
    }
}
class ServiceB extends MicroService_1.MicroService {
    constructor() {
        super();
        this.sourceTag = sourceTag;
        this.sinkTag = sinkTag;
        this.bTag = bTag;
    }
    init() {
        let s = this.QPROP(this.bTag, [this.sourceTag], [this.sinkTag], null);
        let ss = this.lift((sa) => {
            console.log("Got change in B: " + sa[0].value);
            return (sa[0].value + 1);
        })(s);
        this.publishSignal(ss);
    }
}
class SinkService extends MicroService_1.MicroService {
    constructor() {
        super();
        this.aTag = aTag;
        this.bTag = bTag;
        this.sinkTag = sinkTag;
    }
    init() {
        let s = this.QPROP(this.sinkTag, [this.aTag, this.bTag], [], null);
        this.lift((sab) => {
            for (var i in sab[0]) {
                console.log(i);
            }
            console.log("Got change in sink: " + (sab[0] + sab[1]));
        })(s);
    }
}
let source = monitor.spawnActor(SourceService);
let sink = monitor.spawnActor(SinkService);
let a = monitor.spawnActor(ServiceA);
let b = monitor.spawnActor(ServiceB);
//# sourceMappingURL=temp.js.map