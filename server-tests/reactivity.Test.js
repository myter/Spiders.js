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
var chai = require('chai');
var expect = chai.expect;
var spider = require('../src/spiders');
class BasicSignal extends spider.Signal {
    constructor() {
        super();
        this.val = 1;
    }
    increment() {
        this.val++;
    }
}
__decorate([
    spider.mutator
], BasicSignal.prototype, "increment", null);
describe("Local Reactivity", () => {
    it("In main", function (done) {
        class TestApp extends spider.Application {
            constructor() {
                super();
                let sig = this.newSignal(BasicSignal);
                this.lift((v) => {
                    this.res = v.val;
                })(sig);
                sig.increment();
            }
        }
        let app = new TestApp();
        try {
            expect(app.res).to.equal(2);
            app.kill();
            done();
        }
        catch (e) {
            app.kill();
            done(e);
        }
    });
    it("In Actor", function (done) {
        class TestActor extends spider.Actor {
            constructor() {
                super();
                this.sigDef = BasicSignal;
            }
            init() {
                let sig = this.newSignal(this.sigDef);
                this.lift((v) => {
                    this.res = v.val;
                })(sig);
                sig.increment();
            }
        }
        let app = new spider.Application();
        let act = app.spawnActor(TestActor);
        act.res.then((v) => {
            try {
                expect(v).to.equal(2);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
});
describe("Remote Reactivity", () => {
    it("main to actor", function (done) {
        this.timeout(10000);
        class TestApp extends spider.Application {
            createAndSend(toRef) {
                let sig = this.newSignal(BasicSignal);
                toRef.getSignal(sig);
                setTimeout(() => {
                    sig.increment();
                }, 2000);
            }
        }
        class TestActor extends spider.Actor {
            getSignal(sig) {
                this.lift((s) => {
                    this.resolve(s.val);
                })(sig);
            }
            getVal() {
                let prom = new Promise((resolve) => {
                    this.resolve = resolve;
                });
                return prom;
            }
        }
        let app = new TestApp();
        let act = app.spawnActor(TestActor);
        app.createAndSend(act);
        act.getVal().then((v) => {
            try {
                expect(v).to.equal(2);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("actor to actor", function (done) {
        this.timeout(10000);
        class Producer extends spider.Actor {
            constructor() {
                super();
                this.BasicSignal = BasicSignal;
            }
            createAndSend(consumerRef) {
                let sig = this.newSignal(this.BasicSignal);
                consumerRef.getSignal(sig);
                setTimeout(() => {
                    sig.increment();
                }, 2000);
            }
        }
        class Consumer extends spider.Actor {
            getSignal(signalRef) {
                this.lift((v) => {
                    this.resolve(v.val);
                })(signalRef);
            }
            getVal() {
                let prom = new Promise((resolve) => {
                    this.resolve = resolve;
                });
                return prom;
            }
        }
        let app = new spider.Application();
        let consumer = app.spawnActor(Consumer);
        let producer = app.spawnActor(Producer);
        producer.createAndSend(consumer);
        consumer.getVal().then((v) => {
            try {
                expect(v).to.equal(2);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("transitive", function (done) {
        this.timeout(10000);
        class TestApp extends spider.Application {
            createAndSend(firstRef, secondRef) {
                let sig = this.newSignal(BasicSignal);
                firstRef.getSignal(sig, secondRef);
                setTimeout(() => {
                    sig.increment();
                }, 4000);
            }
        }
        class Act1 extends spider.Actor {
            getSignal(signalRef, forwardRef) {
                forwardRef.getSignal(signalRef);
            }
        }
        class Act2 extends spider.Actor {
            getSignal(signalRef) {
                this.lift((v) => {
                    this.resolve(v.val);
                })(signalRef);
            }
            getVal() {
                let prom = new Promise((resolve) => {
                    this.resolve = resolve;
                });
                return prom;
            }
        }
        let app = new TestApp();
        let a1 = app.spawnActor(Act1);
        let a2 = app.spawnActor(Act2);
        app.createAndSend(a1, a2);
        a2.getVal().then((v) => {
            try {
                expect(v).to.equal(2);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("pipeline", function (done) {
        this.timeout(10000);
        class TestApp extends spider.Application {
            createAndSend(firstRef, secondRef) {
                let sig = this.newSignal(BasicSignal);
                firstRef.getSignal(sig, secondRef);
                setTimeout(() => {
                    sig.increment();
                }, 4000);
            }
        }
        class Act1 extends spider.Actor {
            getSignal(signalRef, forwardRef) {
                let derived = this.lift((v) => {
                    return v.val * 10;
                })(signalRef);
                forwardRef.getSignal(derived);
            }
        }
        class Act2 extends spider.Actor {
            getSignal(signalRef) {
                this.lift((v) => {
                    this.resolve(v);
                })(signalRef);
            }
            getVal() {
                let prom = new Promise((resolve) => {
                    this.resolve = resolve;
                });
                return prom;
            }
        }
        let app = new TestApp();
        let a1 = app.spawnActor(Act1);
        let a2 = app.spawnActor(Act2);
        app.createAndSend(a1, a2);
        a2.getVal().then((v) => {
            try {
                expect(v).to.equal(20);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
});
describe("Glitch Freedom", () => {
    it("local glitch freedom", function (done) {
        class TestApp extends spider.Application {
            constructor() {
                super();
                let source = this.newSignal(BasicSignal);
                let adder = this.lift((bs) => {
                    return bs.val + 1;
                });
                let add1 = adder(source);
                let add2 = adder(source);
                this.lift((v1, v2) => {
                    this.res = v1 + v2;
                })(add1, add2);
                source.increment();
            }
        }
        let app = new TestApp();
        try {
            expect(app.res).to.equal(6);
            app.kill();
            done();
        }
        catch (e) {
            app.kill();
            done(e);
        }
    });
    it("QPROP simple glitch freedom", function (done) {
        this.timeout(10000);
        let monitor = new ServiceMonitor_1.ServiceMonitor();
        let sourceTag = new SubTag_1.PubSubTag("source");
        let sinkTag = new SubTag_1.PubSubTag("sink");
        let aTag = new SubTag_1.PubSubTag("a");
        let bTag = new SubTag_1.PubSubTag("b");
        class TestSignal extends spider.Signal {
            constructor() {
                super();
                this.value = 1;
            }
            inc() {
                ++this.value;
            }
        }
        __decorate([
            spider.mutator
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
                let t = this.newSignal(this.TestSignal);
                this.QPROP(this.sourceTag, [], [this.aTag, this.bTag], t);
                this.publishSignal(t);
                t.inc();
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
                let ss = this.lift(([s1]) => {
                    return (s1.value + 1);
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
                let s = this.QPROP(this.bTag, [this.sourceTag], [this.sinkTag], -1);
                let ss = this.lift(([s1]) => {
                    return (s1.value + 1);
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
                this.lift(([v1, v2]) => {
                    this.resultVal = v1 + v2;
                })(s);
            }
        }
        monitor.spawnActor(SourceService);
        let sink = monitor.spawnActor(SinkService);
        monitor.spawnActor(ServiceA);
        monitor.spawnActor(ServiceB);
        setTimeout(() => {
            sink.resultVal.then((v) => {
                try {
                    expect(v).to.equal(6);
                    monitor.kill();
                    done();
                }
                catch (e) {
                    monitor.kill();
                    done(e);
                }
            });
        }, 2000);
    });
    it("SIDUP simple glitch freedom", function (done) {
        this.timeout(10000);
        let admitterTag = new SubTag_1.PubSubTag("admitter");
        let monitor = new ServiceMonitor_1.ServiceMonitor();
        let sourceTag = new SubTag_1.PubSubTag("source");
        let sinkTag = new SubTag_1.PubSubTag("sink");
        let aTag = new SubTag_1.PubSubTag("a");
        let bTag = new SubTag_1.PubSubTag("b");
        class TestSignal extends spider.Signal {
            constructor() {
                super();
                this.value = 1;
            }
            inc() {
                ++this.value;
            }
        }
        __decorate([
            spider.mutator
        ], TestSignal.prototype, "inc", null);
        class Admitter extends MicroService_1.MicroService {
            constructor() {
                super();
                this.admitterTag = admitterTag;
            }
            init() {
                this.SIDUPAdmitter(this.admitterTag, 1, 1);
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
                let t = this.newSignal(this.TestSignal);
                this.SIDUP(this.sourceTag, [], this.admitter);
                this.publishSignal(t);
                t.inc();
            }
        }
        class ServiceA extends MicroService_1.MicroService {
            constructor() {
                super();
                this.sourceTag = sourceTag;
                this.sinkTag = sinkTag;
                this.aTag = aTag;
                this.admitter = admitterTag;
            }
            init() {
                let s = this.SIDUP(this.aTag, [this.sourceTag], this.admitter);
                let ss = this.lift(([s1]) => {
                    return (s1.value + 1);
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
                let ss = this.lift(([s1]) => {
                    return (s1.value + 1);
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
                this.lift(([v1, v2]) => {
                    this.resultVal = v1 + v2;
                })(s);
            }
        }
        monitor.spawnActor(SourceService);
        let sink = monitor.spawnActor(SinkService);
        monitor.spawnActor(Admitter);
        monitor.spawnActor(ServiceA);
        monitor.spawnActor(ServiceB);
        setTimeout(() => {
            sink.resultVal.then((v) => {
                try {
                    expect(v).to.equal(6);
                    monitor.kill();
                    done();
                }
                catch (e) {
                    monitor.kill();
                    done(e);
                }
            });
        }, 2000);
    });
});
//# sourceMappingURL=reactivity.Test.js.map