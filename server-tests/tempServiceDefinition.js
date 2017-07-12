var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
/**
 * Created by flo on 02/07/2017.
 */
var spiders = require("../src/spiders");
let CounterSignal = class CounterSignal extends spiders.Signal {
    constructor(initVal) {
        super();
        this.c = initVal;
    }
    inc() {
        this.c++;
    }
    dec() {
        this.c--;
    }
};
__decorate([
    spiders.mutator
], CounterSignal.prototype, "inc", null);
__decorate([
    spiders.mutator
], CounterSignal.prototype, "dec", null);
CounterSignal = __decorate([
    spiders.lease(5000),
    spiders.weak
], CounterSignal);
let LogSignal = class LogSignal extends spiders.Signal {
    constructor(initLog) {
        super();
        this.log = initLog;
    }
    append(text) {
        this.log = this.log + text;
    }
};
__decorate([
    spiders.mutator
], LogSignal.prototype, "append", null);
LogSignal = __decorate([
    spiders.lease(5000),
    spiders.weak
], LogSignal);
class DeriveIsolate extends spiders.Isolate {
    constructor(v) {
        super();
        this.wut = v;
    }
}
class FastPubTestService extends MicroService_1.MicroService {
    init() {
        this.published = this.newSignal(CounterSignal, 1);
        /*this.derived        = this.lift((counter)=>{
            let isol = new DeriveIsolate(counter.c * 10)
            return isol
        })(this.published)*/
        this.publish(this.published, this.newTopic("TestTopic"));
        this.pulse(5);
    }
    pulse(times) {
        if (times > 0) {
            setTimeout(() => {
                this.published.inc();
                this.pulse(times - 1);
            }, 2000);
        }
    }
}
exports.FastPubTestService = FastPubTestService;
class SlowPubTestService extends MicroService_1.MicroService {
    init() {
        this.published = this.newSignal(LogSignal, "initial:");
        this.publish(this.published, this.newTopic("LogTopic"));
        this.pulse(5);
    }
    pulse(times) {
        if (times > 0) {
            setTimeout(() => {
                this.published.append(times.toString() + ":");
                this.pulse(times - 1);
            }, 3000);
        }
    }
}
exports.SlowPubTestService = SlowPubTestService;
class SubTestService extends MicroService_1.MicroService {
    init() {
        let res;
        let p = new Promise((resolve) => {
            res = resolve;
        });
        this.subscribe(this.newTopic("TestTopic")).once((sig) => {
            this.counterSig = sig;
            if (this.logSig != null) {
                res();
            }
        });
        this.subscribe(this.newTopic("LogTopic")).once((sig) => {
            this.logSig = sig;
            if (this.counterSig != null) {
                res();
            }
        });
        p.then(() => {
            let f = this.lift((counter, log) => {
                console.log("Counter value: " + counter.c + " log : " + log.log);
            });
            f(this.counterSig, this.logSig);
            let failure = this.liftFailure((_, __) => {
                console.log("Counter and log being garbage collected");
            })(this.counterSig, this.logSig);
            this.liftFailure((_) => {
                console.log("Garbage propagation seems to work");
            })(failure);
        });
    }
}
exports.SubTestService = SubTestService;
//# sourceMappingURL=tempServiceDefinition.js.map