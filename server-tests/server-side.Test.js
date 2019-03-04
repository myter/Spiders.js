/**
 * Created by flo on 06/02/2017.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
/**
 * Created by flo on 10/01/2017.
 */
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
describe("Functionality", () => {
    it("Require", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            constructor() {
                super();
                this.directory = __dirname;
            }
            init() {
                this.mod = require(this.directory + '/testModule');
            }
            invoke() {
                return this.mod.testFunction();
            }
        }
        var actor = app.spawnActor(testActor);
        actor.invoke().then((v) => {
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
    it("Remote", (done) => {
        var app = new spiders_1.Application();
        class testActor1 extends spiders_1.Actor {
            getAndAccess() {
                return this.libs.remote("127.0.0.1", 8082).then((ref) => {
                    return ref.getVal();
                });
            }
        }
        class testActor2 extends spiders_1.Actor {
            getVal() {
                return 5;
            }
        }
        app.spawnActor(testActor2, [], 8082);
        var actor = app.spawnActor(testActor1);
        actor.getAndAccess().then((v) => {
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
    it("Buffered Remote", function (done) {
        this.timeout(4000);
        var app = new spiders_1.Application();
        class testActor1 extends spiders_1.Actor {
            getAndAccess() {
                return new Promise((resolve) => {
                    let rem = this.libs.buffRemote("127.0.0.1", 8082);
                    let ps = [];
                    ps[0] = rem.getVal();
                    ps[1] = rem.someVal;
                    setTimeout(() => {
                        ps[2] = rem.getVal();
                        ps[3] = rem.someVal;
                        resolve(Promise.all(ps));
                    }, 2000);
                });
            }
        }
        class testActor2 extends spiders_1.Actor {
            constructor() {
                super();
                this.someVal = 6;
            }
            getVal() {
                return 5;
            }
        }
        app.spawnActor(testActor2, [], 8082);
        var actor = app.spawnActor(testActor1);
        actor.getAndAccess().then((v) => {
            try {
                expect(v[0]).to.equal(5);
                expect(v[1]).to.equal(6);
                expect(v[2]).to.equal(5);
                expect(v[3]).to.equal(6);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Scope Bundling", (done) => {
        let app = new spiders_1.Application();
        let someVar = 5;
        class TestIsolate extends spiders_1.SpiderIsolate {
            constructor() {
                super();
                this.val = someVar;
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super();
                let scope = new spiders_1.LexScope();
                scope.addElement("someVar", someVar);
                spiders_1.bundleScope(TestIsolate, scope);
                this.TestIsolate = TestIsolate;
            }
            test() {
                let isol = new this.TestIsolate();
                return isol.val;
            }
        }
        app.spawnActor(TestActor).test().then((v) => {
            try {
                expect(v).to.equal(someVar);
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
describe("Behaviour serialisation", function () {
    this.timeout(5000);
    it("From file", function (done) {
        var app = new spiders_1.Application();
        var act = app.spawnActorFromFile(__dirname + '/testActorDefinition', "TestActor");
        act.getValue().then((val) => {
            try {
                expect(val).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Field serialisation", function (done) {
        this.timeout(3000);
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            constructor() {
                super();
                this.val = 10;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.val.then((v) => {
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
    it("Method serialisation", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            msub() {
                return 5;
            }
            m() {
                return this.msub() + 5;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.m().then((v) => {
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
    it("Construction", (done) => {
        var app = new spiders_1.Application();
        var aValue = 5;
        class testActor extends spiders_1.Actor {
            constructor() {
                super();
                this.val = aValue;
            }
            test() {
                return this.val;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.test().then((v) => {
            try {
                expect(v).to.equal(aValue);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Actor reference passing via constructor", (done) => {
        class referencedActor extends spiders_1.Actor {
            getValue() {
                return 5;
            }
        }
        class referencingActor extends spiders_1.Actor {
            constructor(actorReference) {
                super();
                this.ref = actorReference;
            }
            getValue() {
                return this.ref.getValue().then((v) => { return v; });
            }
        }
        var app = new spiders_1.Application();
        var actor1 = app.spawnActor(referencedActor);
        var actor2 = app.spawnActor(referencingActor, [actor1]);
        actor2.getValue().then((v) => {
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
    it("Initialisation", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            constructor() {
                super();
                this.val = 10;
            }
            init() {
                this.val += 5;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.val.then((v) => {
            try {
                expect(v).to.equal(15);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Initialisation chaining", (done) => {
        var app = new spiders_1.Application();
        class SuperActor extends spiders_1.Actor {
            constructor() {
                super();
                this.val = 10;
            }
            init() {
                this.val += 5;
            }
        }
        class BaseActor extends SuperActor {
            init() {
                this.val = this.val * 2;
            }
        }
        var act = app.spawnActor(BaseActor);
        act.val.then((v) => {
            try {
                expect(v).to.equal(30);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Actor scope", (done) => {
        class testApp extends spiders_1.Application {
        }
        var app = new testApp();
        class testActor extends spiders_1.Actor {
            get() {
                return this.promisePool;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.get().then((v) => {
            try {
                expect(v).to.equal(undefined);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Inheritance (method)", (done) => {
        var app = new spiders_1.Application();
        class baseActor extends spiders_1.Actor {
            test() {
                return 5;
            }
        }
        class inhActor extends baseActor {
            testInh() {
                return this.test();
            }
        }
        var actor = app.spawnActor(inhActor);
        actor.testInh().then((v) => {
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
    it("Inheritance (fields)", (done) => {
        var app = new spiders_1.Application();
        class baseActor extends spiders_1.Actor {
            constructor() {
                super();
                this.baseField = 5;
            }
        }
        class inhActor extends baseActor {
        }
        var actor = app.spawnActor(inhActor);
        actor.baseField.then((v) => {
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
describe("Communication", () => {
    it("Accessing actor instance variable", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            constructor() {
                super();
                this.value = 10;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.value.then((value) => {
            try {
                expect(value).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Invoking method on far reference", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            m() {
                return 10;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.m().then((retVal) => {
            try {
                expect(retVal).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Actor accessing main instance variable", (done) => {
        class testApp extends spiders_1.Application {
            constructor() {
                super();
                this.mainValue = 10;
            }
            checkValue(val) {
                try {
                    expect(val).to.equal(this.mainValue);
                    this.kill();
                    done();
                }
                catch (e) {
                    this.kill();
                    done(e);
                }
            }
        }
        var app = new testApp();
        class testActor extends spiders_1.Actor {
            access() {
                this.parent.mainValue.then((value) => {
                    this.parent.checkValue(value);
                });
            }
        }
        var actor = app.spawnActor(testActor);
        actor.access();
    });
    it("Actor invoking main method", (done) => {
        class testApp extends spiders_1.Application {
            m() {
                try {
                    assert(true);
                    this.kill();
                    done();
                }
                catch (e) {
                    this.kill();
                    done(e);
                }
            }
        }
        var app = new testApp();
        class testActor extends spiders_1.Actor {
            invoke() {
                this.parent.m();
            }
        }
        var actor = app.spawnActor(testActor);
        actor.invoke();
    });
    it("Promise rejection handling (method invocation)", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            m() {
                throw new Error("This is an error");
            }
        }
        var actor = app.spawnActor(testActor);
        actor.m().catch((reason) => {
            try {
                expect(reason.message).to.equal("This is an error");
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Promise pipelining (field access)", (done) => {
        class testApp extends spiders_1.Application {
            constructor() {
                super();
                this.field = 10;
            }
        }
        var app = new testApp();
        class testActor extends spiders_1.Actor {
            get() {
                return this.parent.field;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.get().then((val) => {
            try {
                expect(val).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Promise pipelining (method invocation)", (done) => {
        class testApp extends spiders_1.Application {
            get() {
                return 10;
            }
        }
        var app = new testApp();
        class testActor extends spiders_1.Actor {
            get() {
                return this.parent.get();
            }
        }
        var actor = app.spawnActor(testActor);
        actor.get().then((val) => {
            try {
                expect(val).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Isolate passing", (done) => {
        class mIsolate extends spiders_1.SpiderIsolate {
            constructor() {
                super();
                this.field = 6;
            }
            m() {
                return 5;
            }
        }
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            constructor() {
                super();
                this.mIsolate = mIsolate;
            }
            getIsolate() {
                return new this.mIsolate();
            }
        }
        var actor = app.spawnActor(testActor);
        actor.getIsolate().then((isol) => {
            try {
                expect(isol.field).to.equal(6);
                expect(isol.m()).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Nested isolate passing", (done) => {
        class testApp extends spiders_1.Application {
        }
        class InnerIsolate extends spiders_1.SpiderIsolate {
            constructor() {
                super();
                this.innerField = 5;
            }
        }
        class OuterIsolate extends spiders_1.SpiderIsolate {
            constructor() {
                super();
                this.outerField = 6;
                this.innerIsol = new InnerIsolate();
            }
            getOuterField() {
                return this.outerField;
            }
            getInnerIsolate() {
                return this.innerIsol;
            }
        }
        var app = new testApp();
        class testActor extends spiders_1.Actor {
            constructor() {
                super();
                this.mIsolate = new OuterIsolate();
            }
            getIsolate() {
                return this.mIsolate;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.getIsolate().then((isol) => {
            try {
                expect(isol.getOuterField()).to.equal(6);
                expect(isol.getInnerIsolate().innerField).to.equal(5);
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
describe("General Serialisation", () => {
    it("Correct serialisation of numeric values", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            compute(num) {
                return num + 5;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.compute(5).then((val) => {
            try {
                expect(val).to.equal(10);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Correct serialisation of string values", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            append(str) {
                return str + 5;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.append("5").then((val) => {
            try {
                expect(val).to.equal("55");
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Correct serialisation of boolean values", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            test(bool) {
                if (bool) {
                    return "ok";
                }
                else {
                    return "nok";
                }
            }
        }
        var actor = app.spawnActor(testActor);
        actor.test(false).then((val) => {
            try {
                expect(val).to.equal("nok");
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Correct serialisation of buffer values", (done) => {
        let app = new spiders_1.Application();
        class TestBuffActor extends spiders_1.Actor {
            test() {
                return new Buffer("test");
            }
        }
        let act = app.spawnActor(TestBuffActor);
        let bb = new Buffer("test");
        act.test().then((b) => {
            try {
                expect(b.equals(bb)).to.be.true;
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("User-level promise serialisation", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            async() {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(5);
                    }, 200);
                });
            }
        }
        var actor = app.spawnActor(testActor);
        actor.async().then((val) => {
            try {
                expect(val).to.equal(5);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Method argument serialisation", (done) => {
        var app = new spiders_1.Application();
        class testActor extends spiders_1.Actor {
            m(num, str, bool) {
                return [num, str, bool];
            }
        }
        var actor = app.spawnActor(testActor);
        actor.m(1, "1", true).then((retArr) => {
            try {
                expect(retArr[0]).to.equal(1);
                expect(retArr[1]).to.equal("1");
                expect(retArr[2]).to.equal(true);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Lexical object serialisation during construction", (done) => {
        var app = new spiders_1.Application();
        var ob = {
            field: 5
        };
        class testActor extends spiders_1.Actor {
            constructor() {
                super();
                this.farRef = ob;
            }
            test() {
                return this.farRef.field;
            }
        }
        var actor = app.spawnActor(testActor);
        actor.test().then((v) => {
            try {
                expect(v).to.equal(ob.field);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Far Ref serialisation", (done) => {
        var app = new spiders_1.Application();
        class testActor1 extends spiders_1.Actor {
            constructor() {
                super();
                this.value = 666;
            }
        }
        class testActor2 extends spiders_1.Actor {
            obtainAndAccess(farRef) {
                return farRef.value;
            }
        }
        var actor1 = app.spawnActor(testActor1);
        var actor2 = app.spawnActor(testActor2, [], 8081);
        actor2.obtainAndAccess(actor1).then((v) => {
            try {
                expect(v).to.equal(666);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Map serialisation", (done) => {
        var app = new spiders_1.Application();
        class TestActor extends spiders_1.Actor {
            constructor() {
                super();
                this.m = new Map();
                this.m.set("native", 5);
                this.m.set("object", { x: 5 });
            }
            test() {
                let nat = this.m.get("native");
                return this.m.get("object").x.then((xVal) => {
                    return xVal + nat;
                });
            }
        }
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
});
describe("Meta Actor Protocol", () => {
    it("Reflecting on Actor", function (done) {
        class TestMirror extends spiders_1.SpiderActorMirror {
            constructor() {
                super();
                this.testValue = 5;
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super(new TestMirror());
            }
            test() {
                return this.libs.reflectOnActor().testValue;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
    it("Custom Init", function (done) {
        class TestMirror extends spiders_1.SpiderActorMirror {
            initialise(stdLib, appActor, parentRef) {
                super.initialise(stdLib, appActor, parentRef);
                this.testValue = 5;
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super(new TestMirror());
            }
            init() {
                this.testValue = 5;
            }
            test() {
                return this.libs.reflectOnActor().testValue + this.testValue;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
    it("Custom Receive Invocation", function (done) {
        class TestMirror extends spiders_1.SpiderActorMirror {
            receiveInvocation(sender, target, methodName, args, perform, send) {
                this.testValue = 5;
                super.receiveInvocation(sender, target, methodName, args, perform, send);
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super(new TestMirror());
            }
            test() {
                this.testValue = 5;
                return this.libs.reflectOnActor().testValue + this.testValue;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
    it("Custom Receive Access", function (done) {
        class TestMirror extends spiders_1.SpiderActorMirror {
            receiveAccess(sender, target, fieldName, perform) {
                target[fieldName] += 5;
                super.receiveAccess(sender, target, fieldName, perform);
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super(new TestMirror());
                this.testValue = 5;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.testValue.then((v) => {
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
    it("Custom Send Invocation", function (done) {
        class TestMirror extends spiders_1.SpiderActorMirror {
            sendInvocation(target, methodName, args) {
                this.testValue = 5;
                return super.sendInvocation(target, methodName, args);
            }
        }
        class TestApp extends spiders_1.Application {
            test() {
                return 5;
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super(new TestMirror());
            }
            test() {
                return this.parent.test().then((v) => {
                    return this.libs.reflectOnActor().testValue + v;
                });
            }
        }
        let app = new TestApp();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
    it("Custom Send Access", function (done) {
        class TestMirror extends spiders_1.SpiderActorMirror {
            sendAccess(target, fieldName) {
                this.testValue = 5;
                return super.sendAccess(target, fieldName);
            }
        }
        class TestApp extends spiders_1.Application {
            constructor() {
                super();
                this.testValue = 5;
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super(new TestMirror());
            }
            test() {
                return this.parent.testValue.then((v) => {
                    return this.libs.reflectOnActor().testValue + v;
                });
            }
        }
        let app = new TestApp();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
});
describe("Meta Object Protocol", () => {
    let annot = spiders_1.makeMethodAnnotation((mirror) => {
        mirror.value = 666;
    });
    class TestObject extends spiders_1.SpiderIsolate {
        constructor() {
            super(...arguments);
            this.field = 999;
        }
        meth() {
            return 666;
        }
    }
    __decorate([
        annot
    ], TestObject.prototype, "meth", null);
    it("Reflecting on Object", function (done) {
        class TestMirror extends spiders_1.SpiderObjectMirror {
            constructor() {
                super();
                this.testValue = 5;
            }
        }
        class TestObject extends spiders_1.SpiderObject {
            constructor(mirrorClass) {
                super(new mirrorClass());
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super();
                this.TestObject = TestObject;
                this.TestMirror = TestMirror;
            }
            test() {
                let o = new this.TestObject(this.TestMirror);
                return this.libs.reflectOnObject(o).testValue;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
    it("Custom Invoke", function (done) {
        class TestMirror extends spiders_1.SpiderObjectMirror {
            invoke(methodName, args) {
                this.testValue = 5;
                return super.invoke(methodName, args);
            }
        }
        class TestObject extends spiders_1.SpiderObject {
            constructor(mirrorClass) {
                super(new mirrorClass());
            }
            someMethod() {
                return 5;
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super();
                this.TestObject = TestObject;
                this.TestMirror = TestMirror;
            }
            test() {
                let o = new this.TestObject(this.TestMirror);
                let r = o.someMethod();
                return this.libs.reflectOnObject(o).testValue + r;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
    it("Custom Access", function (done) {
        class TestMirror extends spiders_1.SpiderObjectMirror {
            access(fieldName) {
                this.testValue = 5;
                return super.access(fieldName);
            }
        }
        class TestObject extends spiders_1.SpiderObject {
            constructor(mirrorClass) {
                super(new mirrorClass());
                this.someField = 5;
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super();
                this.TestObject = TestObject;
                this.TestMirror = TestMirror;
            }
            test() {
                let o = new this.TestObject(this.TestMirror);
                let r = o.someField;
                return this.libs.reflectOnObject(o).testValue + r;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
    it("Custom Write", function (done) {
        class TestMirror extends spiders_1.SpiderObjectMirror {
            write(fieldName, value) {
                this.testValue = 5;
                this.base[fieldName] = value * 2;
                return true;
            }
        }
        class TestObject extends spiders_1.SpiderObject {
            constructor(mirrorClass) {
                super(new mirrorClass());
                this.someField = 5;
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super();
                this.TestObject = TestObject;
                this.TestMirror = TestMirror;
            }
            test() {
                let o = new this.TestObject(this.TestMirror);
                let r = o.someField;
                return this.libs.reflectOnObject(o).testValue + r;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
            try {
                expect(v).to.equal(15);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Custom Pass", function (done) {
        class TestMirror extends spiders_1.SpiderIsolateMirror {
            pass(arg) {
                this.testValue = 5;
                return super.pass(arg);
            }
        }
        class TestObject extends spiders_1.SpiderIsolate {
            constructor(mirrorClass) {
                super(new mirrorClass());
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super();
                this.o = new TestObject(TestMirror);
            }
            test() {
                return this.libs.reflectOnObject(this.o).testValue;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
    it("Custom Resolve", function (done) {
        class TestMirror extends spiders_1.SpiderIsolateMirror {
            resolve(mirr) {
                this.testValue = 5;
                return super.resolve(mirr);
            }
        }
        class TestObject extends spiders_1.SpiderIsolate {
            constructor(mirrorClass) {
                super(new mirrorClass());
            }
        }
        class TestActor extends spiders_1.Actor {
            constructor() {
                super();
                this.o = new TestObject(TestMirror);
            }
            test() {
                return this.libs.reflectOnObject(this.o).testValue;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
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
    it("Annotations", function (done) {
        class TestActor extends spiders_1.Actor {
            constructor() {
                super();
                this.TestObject = TestObject;
            }
            test() {
                let t = new this.TestObject();
                t.meth();
                return this.libs.reflectOnObject(t).value;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test().then((v) => {
            try {
                expect(v).to.equal(666);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Annotated method serialisation", function (done) {
        class App extends spiders_1.Application {
            send(toRef) {
                return toRef.getIsol(new TestObject());
            }
        }
        class Act extends spiders_1.Actor {
            getIsol(i) {
                i.meth();
                return this.libs.reflectOnObject(i).value;
            }
        }
        let app = new App();
        let act = app.spawnActor(Act);
        app.send(act).then((v) => {
            try {
                expect(v).to.equal(666);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Introspection list all", function (done) {
        class TT extends spiders_1.Actor {
            test(iso) {
                let mirr = this.libs.reflectOnObject(iso);
                let fields = mirr.getFields();
                let methods = mirr.getMethods();
                let hasField = fields.filter((field) => {
                    return field.name == "field";
                }).length == 1;
                let hasMethod = methods.filter((method) => {
                    return method.name == "meth";
                }).length == 1;
                return fields.length >= 1 && methods.length >= 1 && hasField && hasMethod;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TT);
        act.test(new TestObject()).then((v) => {
            try {
                expect(v).to.be.true;
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Introspection get single", function (done) {
        this.timeout(4000);
        class TestActor extends spiders_1.Actor {
            test(iso) {
                let mirr = this.libs.reflectOnObject(iso);
                let field = mirr.getField("field");
                let method = mirr.getMethod("meth");
                return field.value == 999 && method.value() == 666;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test(new TestObject()).then((v) => {
            try {
                expect(v).to.be.true;
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
    it("Self Modification", function (done) {
        this.timeout(4000);
        class TestActor extends spiders_1.Actor {
            test(iso) {
                let mirr = this.libs.reflectOnObject(iso);
                mirr.addField("test", 999);
                mirr.addMethod("testM", () => {
                    return 666;
                });
                return iso.test == 999 && iso.testM() == 666;
            }
        }
        let app = new spiders_1.Application();
        let act = app.spawnActor(TestActor);
        act.test(new TestObject()).then((v) => {
            try {
                expect(v).to.be.true;
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
//# sourceMappingURL=server-side.Test.js.map