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
let admitterTag = new SubTag_1.PubSubTag("admitter");
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
        this.bool = false;
    }
    change() {
        this.bool = !this.bool;
    }
}
__decorate([
    spiders.mutator
], Test2Signal.prototype, "change", null);
let monitor = new ServiceMonitor_1.ServiceMonitor();
class Admitter extends MicroService_1.MicroService {
    constructor() {
        super();
        this.admitterTag = admitterTag;
    }
    init() {
        this.SIDUPAdmitter(this.admitterTag, 2, 1);
    }
}
class SourceService extends MicroService_1.MicroService {
    constructor() {
        super();
        this.sourceTag = sourceTag;
        this.aTag = aTag;
        this.bTag = bTag;
        this.TestSignal = TestSignal;
        this.sinkTag = sinkTag;
        this.admitter = admitterTag;
    }
    init() {
        this.SIDUP(this.sourceTag, [], this.admitter);
        let t = this.newSignal(this.TestSignal);
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
        this.sourceTag = source2Tag;
        this.aTag = aTag;
        this.bTag = bTag;
        this.TestSignal = Test2Signal;
        this.sinkTag = sinkTag;
        this.admitter = admitterTag;
    }
    init() {
        this.SIDUP(this.sourceTag, [], this.admitter);
        let t = this.newSignal(this.TestSignal);
        this.publishSignal(t);
        this.update(t);
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
        this.source2Tag = source2Tag;
        this.sinkTag = sinkTag;
        this.aTag = aTag;
        this.admitter = admitterTag;
    }
    init() {
        let s = this.SIDUP(this.aTag, [this.sourceTag, this.source2Tag], this.admitter);
        let ss = this.lift((sa) => {
            if (sa[1]) {
                console.log("Got change in A: " + sa[0].value + " : " + sa[1].bool);
            }
            else {
                console.log("Got change in A: " + sa[0].value);
            }
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
        this.admitter = admitterTag;
    }
    init() {
        let s = this.SIDUP(this.bTag, [this.sourceTag], this.admitter);
        let ss = this.lift((sa) => {
            if (sa[1]) {
                console.log("Got change in B: " + sa[0].value + " : " + sa[1].bool);
            }
            else {
                console.log("Got change in B: " + sa[0].value);
            }
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
        this.admitter = admitterTag;
    }
    init() {
        let s = this.SIDUP(this.sinkTag, [this.aTag, this.bTag], this.admitter, true);
        this.lift((vals) => {
            console.log("Got change in sink: " + vals);
        })(s);
    }
}
let adm = monitor.spawnActor(Admitter);
let source = monitor.spawnActor(SourceService);
let source2 = monitor.spawnActor(Source2Service);
let sink = monitor.spawnActor(SinkService);
let a = monitor.spawnActor(ServiceA);
let b = monitor.spawnActor(ServiceB);
setTimeout(() => {
    console.log("Adding dependency");
    adm.addDependency(source2Tag, bTag);
}, 7000);
/*class DynamicService extends MicroService{
    sinkTag
    sourceTag
    dynTag

    constructor(){
        super()
        this.sinkTag = sinkTag
        this.sourceTag = sourceTag
        this.dynTag = dynTag
    }

    init(){
        let s = this.QPROP(this.dynTag,[this.sourceTag],[this.sinkTag],null)
        let ss = this.lift((sa)=>{
            console.log("Got change in dynamic: "+ sa[0].value)
            return (sa[0].value + 1)
        })(s)
        this.publishSignal(ss)
    }

}*/ 
//# sourceMappingURL=tempSIDUP.js.map