/**
 * Created by flo on 06/02/2017.
 */
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_chai_index.d.ts"/>
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_mocha_index.d.ts"/>
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Created by flo on 10/01/2017.
 */
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var spider = require('../src/spiders');
var serialisation = require('../src/serialisation');
describe("Behaviour serialisation", function () {
    it("Field serialisation", function (done) {
        this.timeout(3000);
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.call(this);
                this.val = 10;
            }
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.val.then(function (v) {
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
    it("Method serialisation", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.msub = function () {
                return 5;
            };
            testActor.prototype.m = function () {
                return this.msub() + 5;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.m().then(function (v) {
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
    it("Construction", function (done) {
        var app = new spider.Application();
        var aValue = 5;
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.call(this);
                this.val = aValue;
            }
            testActor.prototype.test = function () {
                return this.val;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.test().then(function (v) {
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
    it("Actor reference passing via constructor", function (done) {
        var referencedActor = (function (_super) {
            __extends(referencedActor, _super);
            function referencedActor() {
                _super.apply(this, arguments);
            }
            referencedActor.prototype.getValue = function () {
                return 5;
            };
            return referencedActor;
        }(spider.Actor));
        var referencingActor = (function (_super) {
            __extends(referencingActor, _super);
            function referencingActor(actorReference) {
                _super.call(this);
                this.ref = actorReference;
            }
            referencingActor.prototype.getValue = function () {
                return this.ref.getValue().then(function (v) { return v; });
            };
            return referencingActor;
        }(spider.Actor));
        var app = new spider.Application();
        var actor1 = app.spawnActor(referencedActor);
        var actor2 = app.spawnActor(referencingActor, [actor1]);
        actor2.getValue().then(function (v) {
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
    it("Initialisation", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.call(this);
                this.val = 10;
            }
            testActor.prototype.init = function () {
                this.val += 5;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.val.then(function (v) {
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
    it("Initialisation chaining", function (done) {
        var app = new spider.Application();
        var SuperActor = (function (_super) {
            __extends(SuperActor, _super);
            function SuperActor() {
                _super.call(this);
                this.val = 10;
            }
            SuperActor.prototype.init = function () {
                this.val += 5;
            };
            return SuperActor;
        }(spider.Actor));
        var BaseActor = (function (_super) {
            __extends(BaseActor, _super);
            function BaseActor() {
                _super.apply(this, arguments);
            }
            BaseActor.prototype.init = function () {
                this.val = this.val * 2;
            };
            return BaseActor;
        }(SuperActor));
        var act = app.spawnActor(BaseActor);
        act.val.then(function (v) {
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
    it("Actor scope", function (done) {
        var testApp = (function (_super) {
            __extends(testApp, _super);
            function testApp() {
                _super.apply(this, arguments);
            }
            return testApp;
        }(spider.Application));
        var app = new testApp();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.get = function () {
                return this.promisePool;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.get().then(function (v) {
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
    it("Inheritance (method)", function (done) {
        var app = new spider.Application();
        var baseActor = (function (_super) {
            __extends(baseActor, _super);
            function baseActor() {
                _super.apply(this, arguments);
            }
            baseActor.prototype.test = function () {
                return 5;
            };
            return baseActor;
        }(spider.Actor));
        var inhActor = (function (_super) {
            __extends(inhActor, _super);
            function inhActor() {
                _super.apply(this, arguments);
            }
            inhActor.prototype.testInh = function () {
                return this.test();
            };
            return inhActor;
        }(baseActor));
        var actor = app.spawnActor(inhActor);
        actor.testInh().then(function (v) {
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
    it("Inheritance (fields)", function (done) {
        var app = new spider.Application();
        var baseActor = (function (_super) {
            __extends(baseActor, _super);
            function baseActor() {
                _super.call(this);
                this.baseField = 5;
            }
            return baseActor;
        }(spider.Actor));
        var inhActor = (function (_super) {
            __extends(inhActor, _super);
            function inhActor() {
                _super.apply(this, arguments);
            }
            return inhActor;
        }(baseActor));
        var actor = app.spawnActor(inhActor);
        actor.baseField.then(function (v) {
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
    /*it("Static Fields & methods",(done)=>{
        var app = new spider.Application()
        class StaticActor extends spider.Actor{
            static _STATIC_FIELD_ = 5
            static _STATIC_METHOD_(){
                return 6
            }
            getField(){
                return this.StaticActor._STATIC_FIELD_
            }
            getMethod(){
                return this.StaticActor._STATIC_METHOD_()
            }
        }
        var act = app.spawnActor(StaticActor)
        act.getField().then((fieldVal)=>{
            try{
                expect(fieldVal).to.equal(StaticActor._STATIC_FIELD_)
                act.getMethod().then((methodVal)=>{
                    try{
                        expect(methodVal).to.equal(StaticActor._STATIC_METHOD_())
                        app.kill()
                        done()
                    }
                    catch(e){
                        app.kill()
                        done(e)
                    }
                })
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Static inheritance",(done)=>{
        var app = new spider.Application()
        class SuperActor extends spider.Actor{
            static _SUPER_STATIC_ = 5
        }
        class BaseActor extends SuperActor{
            getField(){
                return SuperActor._SUPER_STATIC_
            }
        }
        var act = app.spawnActor(BaseActor)
        act.getField().then((v)=>{
            try{
                expect(v).to.equal(SuperActor._SUPER_STATIC_)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Static immutable",(done)=>{
        var app = new spider.Application()
        class StaticActor extends spider.Actor{
            static _FIELD_ = 5
            changeField(){
                return StaticActor._FIELD_ = 6
            }
        }
        var act = app.spawnActor(StaticActor)
        act.changeField().catch((error)=>{
            app.kill()
            done()
        })

    })*/
});
describe("Functionality", function () {
    it("Require", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.call(this);
                this.directory = __dirname;
            }
            testActor.prototype.init = function () {
                this.mod = require(this.directory + '/testModule');
            };
            testActor.prototype.invoke = function () {
                return this.mod.testFunction();
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.invoke().then(function (v) {
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
    it("Remote", function (done) {
        var app = new spider.Application();
        var testActor1 = (function (_super) {
            __extends(testActor1, _super);
            function testActor1() {
                _super.apply(this, arguments);
            }
            testActor1.prototype.getAndAccess = function () {
                return this.remote("127.0.0.1", 8082).then(function (ref) {
                    return ref.getVal();
                });
            };
            return testActor1;
        }(spider.Actor));
        var testActor2 = (function (_super) {
            __extends(testActor2, _super);
            function testActor2() {
                _super.apply(this, arguments);
            }
            testActor2.prototype.getVal = function () {
                return 5;
            };
            return testActor2;
        }(spider.Actor));
        app.spawnActor(testActor2, [], 8082);
        var actor = app.spawnActor(testActor1);
        actor.getAndAccess().then(function (v) {
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
describe("Communication", function () {
    it("Accessing actor instance variable", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.call(this);
                this.value = 10;
            }
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.value.then(function (value) {
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
    it("Invoking method on far reference", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.m = function () {
                return 10;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.m().then(function (retVal) {
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
    it("Actor accessing main instance variable", function (done) {
        var testApp = (function (_super) {
            __extends(testApp, _super);
            function testApp() {
                _super.call(this);
                this.mainValue = 10;
            }
            testApp.prototype.checkValue = function (val) {
                try {
                    expect(val).to.equal(this.mainValue);
                    this.kill();
                    done();
                }
                catch (e) {
                    this.kill();
                    done(e);
                }
            };
            return testApp;
        }(spider.Application));
        var app = new testApp();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.access = function () {
                var _this = this;
                this.parent.mainValue.then(function (value) {
                    _this.parent.checkValue(value);
                });
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.access();
    });
    it("Actor invoking main method", function (done) {
        var testApp = (function (_super) {
            __extends(testApp, _super);
            function testApp() {
                _super.apply(this, arguments);
            }
            testApp.prototype.m = function () {
                try {
                    assert(true);
                    this.kill();
                    done();
                }
                catch (e) {
                    this.kill();
                    done(e);
                }
            };
            return testApp;
        }(spider.Application));
        var app = new testApp();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.invoke = function () {
                this.parent.m();
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.invoke();
    });
    it("Promise rejection handling (method invocation)", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.m = function () {
                throw new Error("This is an error");
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.m().catch(function (reason) {
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
    it("Promise pipelining (field access)", function (done) {
        var testApp = (function (_super) {
            __extends(testApp, _super);
            function testApp() {
                _super.call(this);
                this.field = 10;
            }
            return testApp;
        }(spider.Application));
        var app = new testApp();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.get = function () {
                return this.parent.field;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.get().then(function (val) {
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
    it("Promise pipelining (method invocation)", function (done) {
        var testApp = (function (_super) {
            __extends(testApp, _super);
            function testApp() {
                _super.apply(this, arguments);
            }
            testApp.prototype.get = function () {
                return 10;
            };
            return testApp;
        }(spider.Application));
        var app = new testApp();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.get = function () {
                return this.parent.get();
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.get().then(function (val) {
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
    it("Isolate passing", function (done) {
        var mIsolate = (function (_super) {
            __extends(mIsolate, _super);
            function mIsolate() {
                _super.call(this);
                this.field = 6;
            }
            mIsolate.prototype.m = function () {
                return 5;
            };
            return mIsolate;
        }(spider.Isolate));
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.call(this);
                this.mIsolate = mIsolate;
            }
            testActor.prototype.getIsolate = function () {
                return new this.mIsolate();
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.getIsolate().then(function (isol) {
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
    it("Array Isolate passing", function (done) {
        var app = new spider.Application();
        var testActor1 = (function (_super) {
            __extends(testActor1, _super);
            function testActor1() {
                _super.apply(this, arguments);
            }
            testActor1.prototype.getArrayLength = function (arr) {
                return arr.length;
            };
            return testActor1;
        }(spider.Actor));
        var testActor2 = (function (_super) {
            __extends(testActor2, _super);
            function testActor2() {
                _super.apply(this, arguments);
            }
            testActor2.prototype.sendArray = function (ref) {
                return ref.getArrayLength(new this.ArrayIsolate([1, 2, 3, 4, 5]));
            };
            return testActor2;
        }(spider.Actor));
        var actor1 = app.spawnActor(testActor1);
        var actor2 = app.spawnActor(testActor2, [], 8082);
        actor2.sendArray(actor1).then(function (val) {
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
    it("Nested isolate passing", function (done) {
        var testApp = (function (_super) {
            __extends(testApp, _super);
            function testApp() {
                _super.apply(this, arguments);
            }
            return testApp;
        }(spider.Application));
        var innerIsolate = (function (_super) {
            __extends(innerIsolate, _super);
            function innerIsolate() {
                _super.call(this);
                this.innerField = 5;
            }
            return innerIsolate;
        }(spider.Isolate));
        var outerIsolate = (function (_super) {
            __extends(outerIsolate, _super);
            function outerIsolate() {
                _super.call(this);
                this.outerField = 6;
                this.innerIsol = new innerIsolate();
            }
            outerIsolate.prototype.getOuterField = function () {
                return this.outerField;
            };
            outerIsolate.prototype.getInnerIsolate = function () {
                return this.innerIsol;
            };
            return outerIsolate;
        }(spider.Isolate));
        var app = new testApp();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.call(this);
                this.mIsolate = new outerIsolate();
            }
            testActor.prototype.getIsolate = function () {
                return this.mIsolate;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.getIsolate().then(function (isol) {
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
describe("General Serialisation", function () {
    it("Correct serialisation of numeric values", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.compute = function (num) {
                return num + 5;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.compute(5).then(function (val) {
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
    it("Correct serialisation of string values", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.append = function (str) {
                return str + 5;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.append("5").then(function (val) {
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
    it("Correct serialisation of boolean values", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.test = function (bool) {
                if (bool) {
                    return "ok";
                }
                else {
                    return "nok";
                }
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.test(false).then(function (val) {
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
    it("User-level promise serialisation", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.async = function () {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve(5);
                    }, 200);
                });
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.async().then(function (val) {
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
    it("Method argument serialisation", function (done) {
        var app = new spider.Application();
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.apply(this, arguments);
            }
            testActor.prototype.m = function (num, str, bool) {
                return [num, str, bool];
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.m(1, "1", true).then(function (retArr) {
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
    it("Lexical object serialisation during construction", function (done) {
        var app = new spider.Application();
        var ob = {
            field: 5
        };
        var testActor = (function (_super) {
            __extends(testActor, _super);
            function testActor() {
                _super.call(this);
                this.farRef = ob;
            }
            testActor.prototype.test = function () {
                return this.farRef.field;
            };
            return testActor;
        }(spider.Actor));
        var actor = app.spawnActor(testActor);
        actor.test().then(function (v) {
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
    it("Far Ref serialisation", function (done) {
        var app = new spider.Application();
        var testActor1 = (function (_super) {
            __extends(testActor1, _super);
            function testActor1() {
                _super.call(this);
                this.value = 666;
            }
            return testActor1;
        }(spider.Actor));
        var testActor2 = (function (_super) {
            __extends(testActor2, _super);
            function testActor2() {
                _super.apply(this, arguments);
            }
            testActor2.prototype.obtainAndAccess = function (farRef) {
                return farRef.value;
            };
            return testActor2;
        }(spider.Actor));
        var actor1 = app.spawnActor(testActor1);
        var actor2 = app.spawnActor(testActor2, [], 8081);
        actor2.obtainAndAccess(actor1).then(function (v) {
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
    //TODO this is impossible given that farRef is actually a function (applicable proxy)
    /*it("Method serialisation as far ref",(done) => {
     class testApp extends spider.Application{

     }
     var app = new testApp()
     class testActor extends spider.Actor{
     m(){
     return function(){
     return 5
     }
     }
     }
     var actor = app.spawnActor(testActor)
     actor.m().then((farRef) => {
     farRef.apply().then((v) => {
     try{
     expect(v).to.equal(5)
     app.kill()
     done()
     }
     catch(e){
     app.kill()
     done(e)
     }
     })
     })
     })*/
});
