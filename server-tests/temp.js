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
let source2Tag = new SubTag_1.PubSubTag("source2");
let sinkTag = new SubTag_1.PubSubTag("sink");
let aTag = new SubTag_1.PubSubTag("a");
let bTag = new SubTag_1.PubSubTag("b");
let dynTag = new SubTag_1.PubSubTag("dynamic");
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
class Test2Signal extends spiders.Signal {
    constructor() {
        super();
        this.bool = true;
    }
    change() {
        this.bool = !this.bool;
    }
}
__decorate([
    spiders.mutator
], Test2Signal.prototype, "change", null);
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
        let t = this.newSignal(this.TestSignal);
        this.QPROP(this.sourceTag, [], [this.aTag, this.bTag], t);
        this.publishSignal(t);
        this.update(t);
    }
    update(t) {
        setTimeout(() => {
            t.inc();
            this.update(t);
        }, 2000);
    }
}
class Source2Service extends MicroService_1.MicroService {
    constructor() {
        super();
        this.source2Tag = source2Tag;
        this.TestSignal = Test2Signal;
        this.bTag = bTag;
        this.aTag = aTag;
    }
    init() {
        let t = this.newSignal(this.TestSignal);
        this.QPROP(this.source2Tag, [], [this.bTag], t);
        this.publishSignal(t);
        this.update(t);
        setTimeout(() => {
            console.log("Adding dependency");
            this.addDependency(this.source2Tag, this.aTag);
        }, 7000);
    }
    update(t) {
        setTimeout(() => {
            t.change();
            this.update(t);
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
        let s = this.QPROP(this.aTag, [this.sourceTag], [this.sinkTag], -1);
        let ss = this.lift(([s1, s2]) => {
            if (s2) {
                console.log("Got change in A: " + s1.value + " : " + s2.bool);
            }
            else {
                console.log("Got change in A: " + s1.value);
            }
            return (s1.value + 1);
        })(s);
        this.publishSignal(ss);
    }
}
class ServiceB extends MicroService_1.MicroService {
    constructor() {
        super();
        this.sourceTag = sourceTag;
        this.source2Tag = source2Tag;
        this.sinkTag = sinkTag;
        this.bTag = bTag;
    }
    init() {
        let s = this.QPROP(this.bTag, [this.sourceTag, this.source2Tag], [this.sinkTag], -1);
        let ss = this.lift(([s1, s2]) => {
            if (s2) {
                console.log("Got change in B: " + s1.value + " : " + s2.bool);
            }
            else {
                console.log("Got change in B: " + s1.value);
            }
            return (s1.value + 1);
        })(s);
        this.publishSignal(ss);
    }
}
class DynamicService extends MicroService_1.MicroService {
    constructor() {
        super();
        this.sinkTag = sinkTag;
        this.sourceTag = sourceTag;
        this.dynTag = dynTag;
    }
    init() {
        let s = this.QPROP(this.dynTag, [this.sourceTag], [this.sinkTag], null);
        let ss = this.lift((sa) => {
            console.log("Got change in dynamic: " + sa[0].value);
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
        this.lift((vals) => {
            /*console.log("Got change in sink: " + vals.reduce((prev,curr)=>{
                return prev + curr
            }))*/
            console.log("Got change in sink: " + vals);
        })(s);
    }
}
let source = monitor.spawnActor(SourceService);
let source2 = monitor.spawnActor(Source2Service);
let sink = monitor.spawnActor(SinkService);
let a = monitor.spawnActor(ServiceA);
let b = monitor.spawnActor(ServiceB);
/*setTimeout(()=>{
    monitor.spawnActor(DynamicService)
},3500)*/ 
//# sourceMappingURL=temp.js.map