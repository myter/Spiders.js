Object.defineProperty(exports, "__esModule", { value: true });
const Eventual_1 = require("../src/Onward/Eventual");
const CAPActor_1 = require("../src/Onward/CAPActor");
const Consistent_1 = require("../src/Onward/Consistent");
const Available_1 = require("../src/Onward/Available");
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var spider = require('../src/spiders');
describe("Availables", () => {
    class TestAvailable extends Available_1.Available {
        constructor() {
            super();
            this.value = 5;
        }
        incWithPrim(num) {
            this.value += num;
        }
        incWithCon(con) {
            this.value += con.value;
        }
    }
    it("Check OK Constraint (primitive)", (done) => {
        let app = new spider.Application();
        class Act extends spider.Actor {
            constructor() {
                super();
                this.TestConsistent = TestAvailable;
            }
            test() {
                let c = new this.TestConsistent();
                c.incWithPrim(5);
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Constraint (Available)", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestAvailable;
            }
            test() {
                let c = new this.TestConsistent();
                let cc = new this.TestConsistent();
                c.incWithCon(cc);
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Constraint (Eventual)", (done) => {
        let app = new spider.Application();
        class TestEventual extends Eventual_1.Eventual {
            constructor() {
                super();
                this.value = 5;
            }
        }
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestAvailable;
                this.TestEventual = TestEventual;
            }
            test() {
                let c = new this.TestConsistent();
                let cc = new this.TestEventual();
                c.incWithCon(cc);
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Assignment (primitive)", (done) => {
        let app = new spider.Application();
        class Act extends spider.Actor {
            constructor() {
                super();
                this.TestConsistent = TestAvailable;
            }
            test() {
                let c = new this.TestConsistent();
                c.value = 6;
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(6);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Assignment (Available)", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestAvailable;
            }
            test() {
                let c = new this.TestConsistent();
                let cc = new this.TestConsistent();
                c.value = cc;
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v.value).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Assignment (Eventual)", (done) => {
        let app = new spider.Application();
        class TestEventual extends Eventual_1.Eventual {
            constructor() {
                super();
                this.value = 5;
            }
        }
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestAvailable;
                this.TestEventual = TestEventual;
            }
            test() {
                let c = new this.TestConsistent();
                let cc = new this.TestEventual();
                c.value = cc;
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v.value).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check NOK Constraint", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestAvailable;
            }
            test() {
                let c = new this.TestConsistent();
                c.incWithCon({ value: 5 });
                return c.value;
            }
        }
        app.spawnActor(Act).test().catch(() => {
            app.kill();
            done();
        });
    });
    it("Check NOK Assignment", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestAvailable;
            }
            test() {
                let c = new this.TestConsistent();
                c.value = { x: 5 };
                return c.value;
            }
        }
        app.spawnActor(Act).test().catch(() => {
            app.kill();
            done();
        });
    });
    it("Class serialisation", (done) => {
        class Act extends spider.Actor {
            constructor() {
                super();
                this.TestConsistent = TestAvailable;
            }
            test() {
                let c = new this.TestConsistent();
                return c.value;
            }
        }
        let app = new spider.Application();
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Consistent Serialisation", (done) => {
        class Act2 extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.c = new TestAvailable();
            }
            test() {
                return this.c.value;
            }
        }
        let app = new spider.Application();
        app.spawnActor(Act2).test().then((v) => {
            try {
                expect(v).to.equal(5);
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
describe("Eventuals", () => {
    class TestEventual extends Eventual_1.Eventual {
        constructor() {
            super();
            this.v1 = 5;
        }
        inc() {
            this.v1++;
        }
        incWithPrim(v) {
            this.v1 += v;
        }
        incWithCon(c) {
            this.v1 += c.v1;
        }
    }
    it("Check OK Constraint (primitive)", (done) => {
        let app = new spider.Application();
        class Act extends spider.Actor {
            constructor() {
                super();
                this.TestConsistent = TestEventual;
            }
            test() {
                let c = new this.TestConsistent();
                c.incWithPrim(5);
                return c.v1;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Constraint (Eventual)", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestEventual;
            }
            test() {
                let c = new this.TestConsistent();
                let cc = new this.TestConsistent();
                c.incWithCon(cc);
                return c.v1;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Assignment (primitive)", (done) => {
        let app = new spider.Application();
        class Act extends spider.Actor {
            constructor() {
                super();
                this.TestConsistent = TestEventual;
            }
            test() {
                let c = new this.TestConsistent();
                c.v1 = 6;
                return c.v1;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(6);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Assignment (Eventual)", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestEventual;
            }
            test() {
                let c = new this.TestConsistent();
                let cc = new this.TestConsistent();
                c.v1 = cc;
                return c.v1;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v.v1).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check NOK Constraint", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestEventual;
            }
            test() {
                let c = new this.TestConsistent();
                c.incWithCon({ value: 5 });
                return c.value;
            }
        }
        app.spawnActor(Act).test().catch(() => {
            app.kill();
            done();
        });
    });
    it("Check NOK Assignment", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestEventual;
            }
            test() {
                let c = new this.TestConsistent();
                c.v1 = { x: 5 };
                return c.value;
            }
        }
        app.spawnActor(Act).test().catch(() => {
            app.kill();
            done();
        });
    });
    it("Class Serialisation", (done) => {
        class Act extends spider.Actor {
            constructor() {
                super();
                this.TestEventual = TestEventual;
            }
            test() {
                let ev = new this.TestEventual();
                return ev.v1;
            }
        }
        let app = new spider.Application();
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Eventual Serialisation", function (done) {
        class Act2 extends spider.Actor {
            constructor() {
                super();
                this.ev = new TestEventual();
            }
            test() {
                return this.ev.v1;
            }
        }
        let app = new spider.Application();
        app.spawnActor(Act2).test().then((v) => {
            try {
                expect(v).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Simple Replication, master change", function (done) {
        this.timeout(4000);
        let app = new spider.Application();
        class Master extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.ev = new TestEventual();
            }
            sendAndInc(toRef) {
                toRef.getEv(this.ev);
                this.ev.inc();
            }
        }
        class Slave extends CAPActor_1.CAPActor {
            getEv(anEv) {
                this.ev = anEv;
            }
            test() {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(this.ev.v1);
                    }, 2000);
                });
            }
        }
        let slave = app.spawnActor(Slave);
        let master = app.spawnActor(Master);
        master.sendAndInc(slave);
        slave.test().then((v) => {
            try {
                expect(v).to.equal(6);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Simple Replication, slave change", function (done) {
        this.timeout(4000);
        let app = new spider.Application();
        class Master extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.ev = new TestEventual();
            }
            send(toRef) {
                toRef.getEv(this.ev);
            }
            test() {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(this.ev.v1);
                    }, 2000);
                });
            }
        }
        class Slave extends CAPActor_1.CAPActor {
            getEv(anEv) {
                anEv.inc();
            }
        }
        let slave = app.spawnActor(Slave);
        let master = app.spawnActor(Master);
        master.send(slave);
        master.test().then((v) => {
            try {
                expect(v).to.equal(6);
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
describe("Consistents", () => {
    class TestConsistent extends Consistent_1.Consistent {
        constructor() {
            super();
            this.value = 5;
        }
        incWithPrim(num) {
            this.value += num;
        }
        incWithCon(con) {
            this.value += con.value;
        }
    }
    it("Check OK Constraint (primitive)", (done) => {
        let app = new spider.Application();
        class Act extends spider.Actor {
            constructor() {
                super();
                this.TestConsistent = TestConsistent;
            }
            test() {
                let c = new this.TestConsistent();
                c.incWithPrim(5);
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Constraint (Consistent)", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestConsistent;
            }
            test() {
                let c = new this.TestConsistent();
                let cc = new this.TestConsistent();
                c.incWithCon(cc);
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Assignment (primitive)", (done) => {
        let app = new spider.Application();
        class Act extends spider.Actor {
            constructor() {
                super();
                this.TestConsistent = TestConsistent;
            }
            test() {
                let c = new this.TestConsistent();
                c.value = 6;
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(6);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Check OK Assignment (Consistent)", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestConsistent;
            }
            test() {
                let c = new this.TestConsistent();
                let cc = new this.TestConsistent();
                c.value = cc;
                return c.value;
            }
        }
        app.spawnActor(Act).test().then((v) => {
            v.value.then((vv) => {
                try {
                    expect(vv).to.equal(5);
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
    it("Check NOK Constraint", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestConsistent;
            }
            test() {
                let c = new this.TestConsistent();
                c.incWithCon({ value: 5 });
                return c.value;
            }
        }
        app.spawnActor(Act).test().catch(() => {
            app.kill();
            done();
        });
    });
    it("Check NOK Assignment", (done) => {
        let app = new spider.Application();
        class Act extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.TestConsistent = TestConsistent;
            }
            test() {
                let c = new this.TestConsistent();
                c.value = { x: 5 };
                return c.value;
            }
        }
        app.spawnActor(Act).test().catch(() => {
            app.kill();
            done();
        });
    });
    it("Class serialisation", (done) => {
        class Act extends spider.Actor {
            constructor() {
                super();
                this.TestConsistent = TestConsistent;
            }
            test() {
                let c = new this.TestConsistent();
                return c.value;
            }
        }
        let app = new spider.Application();
        app.spawnActor(Act).test().then((v) => {
            try {
                expect(v).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Consistent Serialisation", (done) => {
        class Act2 extends CAPActor_1.CAPActor {
            constructor() {
                super();
                this.c = new TestConsistent();
            }
            test() {
                return this.c.value;
            }
        }
        let app = new spider.Application();
        app.spawnActor(Act2).test().then((v) => {
            try {
                expect(v).to.equal(5);
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
//# sourceMappingURL=cap.Test.js.map