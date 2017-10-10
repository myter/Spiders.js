///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_chai_index.d.ts"/>
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_mocha_index.d.ts"/>
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    //TODO distributed glitch freedom (obviously)
});
//# sourceMappingURL=reactivity.Test.js.map