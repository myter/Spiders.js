var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
const signal_1 = require("../src/Reactivivity/signal");
/**
 * Created by flo on 02/07/2017.
 */
var spiders = require("../src/spiders");
class CounterSignal extends spiders.Signal {
    //TODO specify boundaries
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
}
__decorate([
    signal_1.mutator
], CounterSignal.prototype, "inc", null);
__decorate([
    signal_1.mutator
], CounterSignal.prototype, "dec", null);
class DeriveIsolate extends spiders.Isolate {
    constructor(v) {
        super();
        this.wut = v;
    }
}
class FastPubTestService extends MicroService_1.MicroService {
    init() {
        this.published = this.newSignal(CounterSignal, 1);
        this.derived = this.lift((counter) => {
            let isol = new DeriveIsolate(counter.c * 10);
            return isol;
        })(this.published);
        //this.leaseSignal(this.published,5000,Infinity)
        this.publish(this.published, this.newTopic("TestTopic"));
        this.pulse(10);
    }
    pulse(times) {
        if (times > 0) {
            setTimeout(() => {
                if (times % 2 == 0) {
                    this.published.inc();
                }
                else {
                    this.published.dec();
                }
                this.pulse(times - 1);
            }, 4000);
        }
    }
}
exports.FastPubTestService = FastPubTestService;
class SubTestService extends MicroService_1.MicroService {
    init() {
        this.subscribe(this.newTopic("TestTopic")).each((sig) => {
            console.log("Got sub val ");
            let f = this.lift((v) => {
                console.log("New val (FUCK YEAH) = " + v.c);
            });
            f(sig);
        });
    }
}
exports.SubTestService = SubTestService;
//# sourceMappingURL=tempServiceDefinition.js.map