(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by flo on 18/01/2017.
 */
function testFunction() {
    return 5;
}
exports.testFunction = testFunction;

},{}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 18/01/2017.
 */
var spider = require("../src/spiders");
/**
 * Created by flo on 10/01/2017.
 */
var scheduled = [];
var testApp = (function (_super) {
    __extends(testApp, _super);
    function testApp() {
        var _this = _super.call(this) || this;
        _this.mainValue = 10;
        _this.field = 10;
        return _this;
    }
    testApp.prototype.mainMethod = function () {
        return 10;
    };
    testApp.prototype.getGUI = function () {
        return window.guiField;
    };
    return testApp;
}(spider.Application));
var app = new testApp();
function log(result) {
    if (result.includes("false")) {
        throw new Error("Something went wrong with: " + result);
    }
    else {
        console.log("[TESTING] " + result + " [TESTING]");
    }
}
var testFieldSerActor = (function (_super) {
    __extends(testFieldSerActor, _super);
    function testFieldSerActor() {
        var _this = _super.call(this) || this;
        _this.val = 10;
        return _this;
    }
    return testFieldSerActor;
}(spider.Actor));
var performFieldSer = function () {
    var fieldActor = app.spawnActor(testFieldSerActor);
    return fieldActor.val.then(function (v) {
        log("Field Serialisation: " + (v == 10));
        app.kill();
    });
};
scheduled.push(performFieldSer);
var testMethSerActor = (function (_super) {
    __extends(testMethSerActor, _super);
    function testMethSerActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testMethSerActor.prototype.msub = function () {
        return 5;
    };
    testMethSerActor.prototype.m = function () {
        return this.msub() + 5;
    };
    return testMethSerActor;
}(spider.Actor));
var performMethSer = function () {
    var methActor = app.spawnActor(testMethSerActor);
    return methActor.m().then(function (v) {
        log("Method Serialisaton: " + (v == 10));
        app.kill();
    });
};
scheduled.push(performMethSer);
var aValue = 5;
var testConSerActor = (function (_super) {
    __extends(testConSerActor, _super);
    function testConSerActor() {
        var _this = _super.call(this) || this;
        _this.val = aValue;
        return _this;
    }
    testConSerActor.prototype.test = function () {
        return this.val;
    };
    return testConSerActor;
}(spider.Actor));
var performConSer = function () {
    var actor = app.spawnActor(testConSerActor);
    return actor.test().then(function (v) {
        log("Construction: " + (v == aValue));
        app.kill();
    });
};
scheduled.push(performConSer);
var testInitSerActor = (function (_super) {
    __extends(testInitSerActor, _super);
    function testInitSerActor() {
        var _this = _super.call(this) || this;
        _this.val = 10;
        return _this;
    }
    testInitSerActor.prototype.init = function () {
        this.val += 5;
    };
    return testInitSerActor;
}(spider.Actor));
var peformInitSer = function () {
    var actor = app.spawnActor(testInitSerActor);
    return actor.val.then(function (v) {
        log("Initialisation: " + (v == 15));
        app.kill();
    });
};
scheduled.push(peformInitSer);
var testScopeActor = (function (_super) {
    __extends(testScopeActor, _super);
    function testScopeActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testScopeActor.prototype.get = function () {
        return this.promisePool;
    };
    return testScopeActor;
}(spider.Actor));
var performScopeSer = function () {
    var actor = app.spawnActor(testScopeActor);
    return actor.get().then(function (v) {
        log("Scope: " + (v == undefined));
        app.kill();
    });
};
scheduled.push(performScopeSer);
var baseMethodInhActor = (function (_super) {
    __extends(baseMethodInhActor, _super);
    function baseMethodInhActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    baseMethodInhActor.prototype.test = function () {
        return 5;
    };
    return baseMethodInhActor;
}(spider.Actor));
var inhActor = (function (_super) {
    __extends(inhActor, _super);
    function inhActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    inhActor.prototype.testInh = function () {
        return this.test();
    };
    return inhActor;
}(baseMethodInhActor));
var performMethodInhSer = function () {
    var actor = app.spawnActor(inhActor);
    return actor.testInh().then(function (v) {
        log("Inheritance (Method): " + (v == 5));
        app.kill();
    });
};
scheduled.push(performMethodInhSer);
var baseFieldInhActor = (function (_super) {
    __extends(baseFieldInhActor, _super);
    function baseFieldInhActor() {
        var _this = _super.call(this) || this;
        _this.baseField = 5;
        return _this;
    }
    return baseFieldInhActor;
}(spider.Actor));
var fieldInhActor = (function (_super) {
    __extends(fieldInhActor, _super);
    function fieldInhActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return fieldInhActor;
}(baseFieldInhActor));
var performFieldInhSer = function () {
    var actor = app.spawnActor(fieldInhActor);
    return actor.baseField.then(function (v) {
        log("Inheritance (Field): " + (v == 5));
        app.kill();
    });
};
scheduled.push(performFieldInhSer);
//Due to Browserify's static analyser it is impossible to dynamically require a module. therefore require must happen on actor creation time (the required library is available to the actor is a far reference)
//Warning, this entails that all work done by the required librarby is performed on the spawning thread (use importscripts if needed to require in actor self)
var testReqActor = (function (_super) {
    __extends(testReqActor, _super);
    function testReqActor() {
        var _this = _super.call(this) || this;
        _this.mod = require('/Users/flo/WebstormProjects/Spiders.js/client-tests/clientTestModule');
        return _this;
    }
    testReqActor.prototype.invoke = function () {
        return this.mod.testFunction();
    };
    return testReqActor;
}(spider.Actor));
var performReq = function () {
    var actor = app.spawnActor(testReqActor);
    return actor.invoke().then(function (v) {
        log("Require: " + (v == 5));
        app.kill();
    });
};
scheduled.push(performReq);
var testFieldAccessActor = (function (_super) {
    __extends(testFieldAccessActor, _super);
    function testFieldAccessActor() {
        var _this = _super.call(this) || this;
        _this.value = 10;
        return _this;
    }
    return testFieldAccessActor;
}(spider.Actor));
var performFieldAccess = function () {
    var actor = app.spawnActor(testFieldAccessActor);
    return actor.value.then(function (value) {
        log("Accessing actor instance variable: " + (value == 10));
        app.kill();
    });
};
scheduled.push(performFieldAccess);
var testMethodInvocActor = (function (_super) {
    __extends(testMethodInvocActor, _super);
    function testMethodInvocActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testMethodInvocActor.prototype.m = function () {
        return 10;
    };
    return testMethodInvocActor;
}(spider.Actor));
var performMethodInvoc = function () {
    var actor = app.spawnActor(testMethodInvocActor);
    return actor.m().then(function (retVal) {
        log("Invoking method on far reference: " + (retVal == 10));
        app.kill();
    });
};
scheduled.push(performMethodInvoc);
var testParentAccessActor = (function (_super) {
    __extends(testParentAccessActor, _super);
    function testParentAccessActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testParentAccessActor.prototype.access = function () {
        return this.parent.mainValue;
    };
    return testParentAccessActor;
}(spider.Actor));
var performParentAccess = function () {
    var actor = app.spawnActor(testParentAccessActor);
    return actor.access().then(function (v) {
        log("Actor accessing main instance variable: " + (v == 10));
        app.kill();
    });
};
scheduled.push(performParentAccess);
var testParentInvokeActor = (function (_super) {
    __extends(testParentInvokeActor, _super);
    function testParentInvokeActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testParentInvokeActor.prototype.invoke = function () {
        return this.parent.mainMethod();
    };
    return testParentInvokeActor;
}(spider.Actor));
var performParentInvoke = function () {
    var actor = app.spawnActor(testParentInvokeActor);
    return actor.invoke().then(function (v) {
        log("Actor invoking main method: " + (v == 10));
        app.kill();
    });
};
scheduled.push(performParentInvoke);
var testPromiseRejectActor = (function (_super) {
    __extends(testPromiseRejectActor, _super);
    function testPromiseRejectActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testPromiseRejectActor.prototype.m = function () {
        throw new Error("This is an error");
    };
    return testPromiseRejectActor;
}(spider.Actor));
var performPromiseReject = function () {
    var actor = app.spawnActor(testPromiseRejectActor);
    return actor.m().catch(function (reason) {
        log("Promise rejection handling (method invocation): " + (reason.message == "This is an error"));
        app.kill();
    });
};
scheduled.push(performPromiseReject);
var testPromisePipeActor = (function (_super) {
    __extends(testPromisePipeActor, _super);
    function testPromisePipeActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testPromisePipeActor.prototype.get = function () {
        return this.parent.field;
    };
    return testPromisePipeActor;
}(spider.Actor));
var performPromisePipe = function () {
    var actor = app.spawnActor(testPromisePipeActor);
    return actor.get().then(function (val) {
        log("Promise pipelining (field access)" + (val == 10));
        app.kill();
    });
};
scheduled.push(performPromisePipe);
var testPromiseInvocPipeActor = (function (_super) {
    __extends(testPromiseInvocPipeActor, _super);
    function testPromiseInvocPipeActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testPromiseInvocPipeActor.prototype.get = function () {
        return this.parent.mainMethod();
    };
    return testPromiseInvocPipeActor;
}(spider.Actor));
var performPromiseInvocPipe = function () {
    var actor = app.spawnActor(testPromiseInvocPipeActor);
    return actor.get().then(function (val) {
        log("Promise pipelining (method invocation): " + (val == 10));
        app.kill();
    });
};
scheduled.push(performPromiseInvocPipe);
var mIsolate = (function (_super) {
    __extends(mIsolate, _super);
    function mIsolate() {
        var _this = _super.call(this) || this;
        _this.field = 6;
        return _this;
    }
    mIsolate.prototype.m = function () {
        return 5;
    };
    return mIsolate;
}(spider.Isolate));
var testIsolateActor = (function (_super) {
    __extends(testIsolateActor, _super);
    function testIsolateActor() {
        var _this = _super.call(this) || this;
        _this.mIsolate = mIsolate;
        return _this;
    }
    testIsolateActor.prototype.getIsolate = function () {
        return new this.mIsolate();
    };
    return testIsolateActor;
}(spider.Actor));
var performIsolate = function () {
    var actor = app.spawnActor(testIsolateActor);
    return actor.getIsolate().then(function (isol) {
        log("Isolate passing: " + (isol.field == 6) + " ," + (isol.m() == 5));
        app.kill();
    });
};
scheduled.push(performIsolate);
var innerIsolate = (function (_super) {
    __extends(innerIsolate, _super);
    function innerIsolate() {
        var _this = _super.call(this) || this;
        _this.innerField = 5;
        return _this;
    }
    return innerIsolate;
}(spider.Isolate));
var outerIsolate = (function (_super) {
    __extends(outerIsolate, _super);
    function outerIsolate() {
        var _this = _super.call(this) || this;
        _this.outerField = 6;
        _this.innerIsol = new innerIsolate();
        return _this;
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
var testNestedIsolateActor = (function (_super) {
    __extends(testNestedIsolateActor, _super);
    function testNestedIsolateActor() {
        var _this = _super.call(this) || this;
        _this.mIsolate = new outerIsolate();
        return _this;
    }
    testNestedIsolateActor.prototype.getIsolate = function () {
        return this.mIsolate;
    };
    return testNestedIsolateActor;
}(spider.Actor));
var performNestedIsolate = function () {
    var actor = app.spawnActor(testNestedIsolateActor);
    return actor.getIsolate().then(function (isol) {
        log("Nested Isolate passing: " + (isol.getOuterField() == 6) + " , " + (isol.getInnerIsolate().innerField == 5));
        app.kill();
    });
};
scheduled.push(performNestedIsolate);
var testNumSerActor = (function (_super) {
    __extends(testNumSerActor, _super);
    function testNumSerActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testNumSerActor.prototype.compute = function (num) {
        return num + 5;
    };
    return testNumSerActor;
}(spider.Actor));
var performNumSer = function () {
    var actor = app.spawnActor(testNumSerActor);
    return actor.compute(5).then(function (val) {
        log("Correct serialisation of numeric values: " + (val == 10));
        app.kill();
    });
};
scheduled.push(performNumSer);
var testStringSerActor = (function (_super) {
    __extends(testStringSerActor, _super);
    function testStringSerActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testStringSerActor.prototype.append = function (str) {
        return str + 5;
    };
    return testStringSerActor;
}(spider.Actor));
var performStringSer = function () {
    var actor = app.spawnActor(testStringSerActor);
    return actor.append("5").then(function (val) {
        log("Correct serialisation of string values: " + (val == 55));
        app.kill();
    });
};
scheduled.push(performStringSer);
var testBoolSerActor = (function (_super) {
    __extends(testBoolSerActor, _super);
    function testBoolSerActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testBoolSerActor.prototype.test = function (bool) {
        if (bool) {
            return "ok";
        }
        else {
            return "nok";
        }
    };
    return testBoolSerActor;
}(spider.Actor));
var performBoolSer = function () {
    var actor = app.spawnActor(testBoolSerActor);
    return actor.test(false).then(function (val) {
        log("Correct serialisation of boolean values: " + (val == "nok"));
        app.kill();
    });
};
scheduled.push(performBoolSer);
var testUserPromActor = (function (_super) {
    __extends(testUserPromActor, _super);
    function testUserPromActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testUserPromActor.prototype.async = function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(5);
            }, 200);
        });
    };
    return testUserPromActor;
}(spider.Actor));
var performUserProm = function () {
    var actor = app.spawnActor(testUserPromActor);
    return actor.async().then(function (val) {
        log("User-level promise serialisation: " + (val == 5));
        app.kill();
    });
};
scheduled.push(performUserProm);
var testArgSerActor = (function (_super) {
    __extends(testArgSerActor, _super);
    function testArgSerActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testArgSerActor.prototype.m = function (num, str, bool) {
        return [num, str, bool];
    };
    return testArgSerActor;
}(spider.Actor));
var performArgSer = function () {
    var actor = app.spawnActor(testArgSerActor);
    return actor.m(1, "1", true).then(function (retArr) {
        log("Method argument serialisation: " + (retArr[0] == 1) + " , " + (retArr[1] == "1") + " , " + retArr[2]);
        app.kill();
    });
};
scheduled.push(performArgSer);
var ob = {
    field: 5
};
var testLexObActor = (function (_super) {
    __extends(testLexObActor, _super);
    function testLexObActor() {
        var _this = _super.call(this) || this;
        _this.farRef = ob;
        return _this;
    }
    testLexObActor.prototype.test = function () {
        return this.farRef.field;
    };
    return testLexObActor;
}(spider.Actor));
var performLexOb = function () {
    var actor = app.spawnActor(testLexObActor);
    return actor.test().then(function (v) {
        log("Lexical object serialisation during construction:  " + (v == ob.field));
        app.kill();
    });
};
scheduled.push(performLexOb);
var testFarRefActor1 = (function (_super) {
    __extends(testFarRefActor1, _super);
    function testFarRefActor1() {
        var _this = _super.call(this) || this;
        _this.value = 666;
        return _this;
    }
    return testFarRefActor1;
}(spider.Actor));
var testFarRefActor2 = (function (_super) {
    __extends(testFarRefActor2, _super);
    function testFarRefActor2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testFarRefActor2.prototype.obtainAndAccess = function (farRef) {
        return farRef.value;
    };
    return testFarRefActor2;
}(spider.Actor));
var performFarRef = function () {
    var actor1 = app.spawnActor(testFarRefActor1);
    var actor2 = app.spawnActor(testFarRefActor2);
    return actor2.obtainAndAccess(actor1).then(function (v) {
        log("Far ref serialisation: " + (v == 666));
        app.kill();
    });
};
scheduled.push(performFarRef);
var testGUIActor = (function (_super) {
    __extends(testGUIActor, _super);
    function testGUIActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testGUIActor.prototype.getField = function () {
        return this.parent.getGUI();
    };
    return testGUIActor;
}(spider.Actor));
var performGUI = function () {
    var actor = app.spawnActor(testGUIActor);
    return actor.getField().then(function (v) {
        log("GUI: " + (v == "guiField"));
        app.kill();
    });
};
scheduled.push(performGUI);
var testReferencePassing_ReferencedActor = (function (_super) {
    __extends(testReferencePassing_ReferencedActor, _super);
    function testReferencePassing_ReferencedActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    testReferencePassing_ReferencedActor.prototype.setValue = function (x) { this.x = x; };
    testReferencePassing_ReferencedActor.prototype.getValue = function () { return this.x; };
    return testReferencePassing_ReferencedActor;
}(spider.Actor));
var testReferencePassing_ReferencingActor = (function (_super) {
    __extends(testReferencePassing_ReferencingActor, _super);
    function testReferencePassing_ReferencingActor(ref) {
        var _this = _super.call(this) || this;
        _this.actorreference = ref;
        return _this;
    }
    testReferencePassing_ReferencingActor.prototype.init = function () {
        this.actorreference.setValue(0);
    };
    testReferencePassing_ReferencingActor.prototype.getValue = function () { return this.actorreference.getValue(); };
    return testReferencePassing_ReferencingActor;
}(spider.Actor));
var performActorReferencePassingTest = function () {
    var actor1 = app.spawnActor(testReferencePassing_ReferencedActor);
    var actor2 = app.spawnActor(testReferencePassing_ReferencingActor, [actor1], 8081);
    return actor2.getValue().then(function (v) {
        log("Actor reference passing and referencing in init: " + (v == 0));
        app.kill();
    });
};
scheduled.push(performActorReferencePassingTest);
var arrayIsolate1 = (function (_super) {
    __extends(arrayIsolate1, _super);
    function arrayIsolate1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    arrayIsolate1.prototype.getArrayLength = function (arr) {
        return arr.length;
    };
    return arrayIsolate1;
}(spider.Actor));
var arrayIsolate2 = (function (_super) {
    __extends(arrayIsolate2, _super);
    function arrayIsolate2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    arrayIsolate2.prototype.sendArray = function (ref) {
        return ref.getArrayLength(new this.ArrayIsolate([1, 2, 3, 4, 5]));
    };
    return arrayIsolate2;
}(spider.Actor));
var performArrayIsolateTest = function () {
    var actor1 = app.spawnActor(arrayIsolate1);
    var actor2 = app.spawnActor(arrayIsolate2);
    return actor2.sendArray(actor1).then(function (v) {
        log("Array Isolate passing : " + (v == 5));
    });
};
scheduled.push(performArrayIsolateTest);
var SuperInitActor = (function (_super) {
    __extends(SuperInitActor, _super);
    function SuperInitActor() {
        var _this = _super.call(this) || this;
        _this.val = 10;
        return _this;
    }
    SuperInitActor.prototype.init = function () {
        this.val += 5;
    };
    return SuperInitActor;
}(spider.Actor));
var BaseInitActor = (function (_super) {
    __extends(BaseInitActor, _super);
    function BaseInitActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BaseInitActor.prototype.init = function () {
        this.val = this.val * 2;
    };
    return BaseInitActor;
}(SuperInitActor));
var performInitChaining = function () {
    var a = app.spawnActor(BaseInitActor);
    return a.val.then(function (v) {
        log("Init chaining : " + (v == 30));
    });
};
scheduled.push(performInitChaining);
/*class StaticActor extends spider.Actor{
    static _STATIC_FIELD = 5
    static _STATIC_METHOD_(){
        return 6
    }
    getField(){
        return StaticActor._STATIC_FIELD
    }
    getMethod(){
        return StaticActor._STATIC_METHOD_()
    }
}
var performStaticFieldAndMethod = () =>{
    var a = app.spawnActor(StaticActor)
    return a.getField().then((v)=>{
        log("Static Field access : " + (v == 5))
        return a.getMethod().then((vv)=>{
            log("Static Method access: " + (vv == 6))
        })
    })
}
scheduled.push(performStaticFieldAndMethod)

class StaticSuperActor extends spider.Actor{
    static _STATIC_SUPER_FIELD = 5
}
class StaticBaseActor extends StaticSuperActor{
    getField(){
        return StaticSuperActor._STATIC_SUPER_FIELD
    }
}

var performStaticInheritance = () =>{
    var a = app.spawnActor(StaticBaseActor)
    return a.getField().then((v)=>{
        log("Static inheritance : " + (v == 5))
    })
}
scheduled.push(performStaticInheritance)

class StaticEror extends spider.Actor{
    static _STATIC_FIELD_ = 5
    changeField(){
        return StaticEror._STATIC_FIELD_ = 6
    }
}

var performStaticError = () =>{
    var a = app.spawnActor(StaticEror)
    return a.changeField().catch((e)=>{
        log("Static mutation : " + true)
    })
}
scheduled.push(performStaticError)*/
function performAll(nextTest) {
    nextTest().then(function (dc) {
        if (scheduled.length > 0) {
            performAll(scheduled.pop());
        }
    });
}
performAll(scheduled.pop());

},{"../src/spiders":77,"/Users/flo/WebstormProjects/Spiders.js/client-tests/clientTestModule":1}],3:[function(require,module,exports){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

},{}],4:[function(require,module,exports){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

},{}],5:[function(require,module,exports){

/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};


},{}],6:[function(require,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(){
  "use strict";

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i+1)];
      encoded3 = lookup[base64.charCodeAt(i+2)];
      encoded4 = lookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})();

},{}],7:[function(require,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  for (var i = 0; i < ary.length; i++) {
    var chunk = ary[i];
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      ary[i] = buf;
    }
  }
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary);

  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  mapArrayBufferViews(ary);
  return new Blob(ary, options || {});
};

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],8:[function(require,module,exports){

},{}],9:[function(require,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],10:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],11:[function(require,module,exports){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},{}],12:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":13}],13:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":21}],14:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var keys = require('./keys');
var hasBinary = require('has-binary');
var sliceBuffer = require('arraybuffer.slice');
var after = require('after');
var utf8 = require('wtf-8');

var base64encoder;
if (global && global.ArrayBuffer) {
  base64encoder = require('base64-arraybuffer');
}

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = require('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof global.Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  if (data === undefined) {
    return err;
  }
  // String data
  if (typeof data == 'string') {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      data = tryDecode(data);
      if (data === false) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

function tryDecode(data) {
  try {
    data = utf8.decode(data);
  } catch (e) {
    return false;
  }
  return data;
}

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!base64encoder) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./keys":15,"after":3,"arraybuffer.slice":4,"base64-arraybuffer":6,"blob":7,"has-binary":16,"wtf-8":50}],15:[function(require,module,exports){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

},{}],16:[function(require,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = require('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      // see: https://github.com/Automattic/has-binary/pull/4
      if (obj.toJSON && 'function' == typeof obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":19}],17:[function(require,module,exports){

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{}],18:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],19:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],20:[function(require,module,exports){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],21:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],22:[function(require,module,exports){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],23:[function(require,module,exports){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

},{}],24:[function(require,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

},{}],25:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],26:[function(require,module,exports){

/**
 * Module dependencies.
 */

var url = require('./url');
var parser = require('socket.io-parser');
var Manager = require('./manager');
var debug = require('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup (uri, opts) {
  if (typeof uri === 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.query;
  } else if (opts && 'object' === typeof opts.query) {
    opts.query = encodeQueryString(opts.query);
  }
  return io.socket(parsed.path, opts);
}
/**
 *  Helper method to parse query objects to string.
 * @param {object} query
 * @returns {string}
 */
function encodeQueryString (obj) {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}
/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = require('./manager');
exports.Socket = require('./socket');

},{"./manager":27,"./socket":29,"./url":30,"debug":32,"socket.io-parser":46}],27:[function(require,module,exports){

/**
 * Module dependencies.
 */

var eio = require('engine.io-client');
var Socket = require('./socket');
var Emitter = require('component-emitter');
var parser = require('socket.io-parser');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:manager');
var indexOf = require('indexof');
var Backoff = require('backo2');

/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager (uri, opts) {
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' === typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function () {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function () {
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.engine.id;
    }
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function (v) {
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function (v) {
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function (v) {
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function (v) {
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function (v) {
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function (v) {
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function () {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};

/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function (fn, opts) {
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function () {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function (data) {
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function () {
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function () {
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
};

/**
 * Called upon a ping.
 *
 * @api private
 */

Manager.prototype.onping = function () {
  this.lastPing = new Date();
  this.emitAll('ping');
};

/**
 * Called upon a packet.
 *
 * @api private
 */

Manager.prototype.onpong = function () {
  this.emitAll('pong', new Date() - this.lastPing);
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function (data) {
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function (err) {
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function (nsp, opts) {
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp, opts);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function () {
      socket.id = self.engine.id;
    });

    if (this.autoConnect) {
      // manually call here since connecting evnet is fired before listening
      onConnecting();
    }
  }

  function onConnecting () {
    if (!~indexOf(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function (socket) {
  var index = indexOf(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function (packet) {
  debug('writing packet %j', packet);
  var self = this;
  if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function (encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function () {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function () {
  debug('cleanup');

  var subsLength = this.subs.length;
  for (var i = 0; i < subsLength; i++) {
    var sub = this.subs.shift();
    sub.destroy();
  }

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function () {
  debug('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' === this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function (reason) {
  debug('onclose');

  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function () {
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function () {
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function (err) {
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function () {
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

},{"./on":28,"./socket":29,"backo2":5,"component-bind":9,"component-emitter":31,"debug":32,"engine.io-client":34,"indexof":18,"socket.io-parser":46}],28:[function(require,module,exports){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on (obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function () {
      obj.removeListener(ev, fn);
    }
  };
}

},{}],29:[function(require,module,exports){

/**
 * Module dependencies.
 */

var parser = require('socket.io-parser');
var Emitter = require('component-emitter');
var toArray = require('to-array');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:socket');
var hasBin = require('has-binary');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket (io, nsp, opts) {
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
  if (opts && opts.query) {
    this.query = opts.query;
  }
  if (this.io.autoConnect) this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function () {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function () {
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' === this.io.readyState) this.onopen();
  this.emit('connecting');
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function () {
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function (ev) {
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  packet.options = {};
  packet.options.compress = !this.flags || false !== this.flags.compress;

  // event ack callback
  if ('function' === typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  delete this.flags;

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function (packet) {
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function () {
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' !== this.nsp) {
    if (this.query) {
      this.packet({type: parser.CONNECT, query: this.query});
    } else {
      this.packet({type: parser.CONNECT});
    }
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function (reason) {
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function (packet) {
  if (packet.nsp !== this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function (packet) {
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function (id) {
  var self = this;
  var sent = false;
  return function () {
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function (packet) {
  var ack = this.acks[packet.id];
  if ('function' === typeof ack) {
    debug('calling ack %s with %j', packet.id, packet.data);
    ack.apply(this, packet.data);
    delete this.acks[packet.id];
  } else {
    debug('bad ack %s', packet.id);
  }
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function () {
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function () {
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function () {
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function () {
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function () {
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

/**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.compress = function (compress) {
  this.flags = this.flags || {};
  this.flags.compress = compress;
  return this;
};

},{"./on":28,"component-bind":9,"component-emitter":31,"debug":32,"has-binary":16,"socket.io-parser":46,"to-array":48}],30:[function(require,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = require('parseuri');
var debug = require('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url (uri, loc) {
  var obj = uri;

  // default to window.location
  loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' === typeof uri) {
    if ('/' === uri.charAt(0)) {
      if ('/' === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' !== typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

  return obj;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"debug":32,"parseuri":24}],31:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],32:[function(require,module,exports){
(function (process){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    return exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":33,"_process":25}],33:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug.debug = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting
    args = exports.formatArgs.apply(self, args);

    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/[\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":44}],34:[function(require,module,exports){

module.exports = require('./lib/index');

},{"./lib/index":35}],35:[function(require,module,exports){

module.exports = require('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = require('engine.io-parser');

},{"./socket":36,"engine.io-parser":14}],36:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var transports = require('./transports/index');
var Emitter = require('component-emitter');
var debug = require('debug')('engine.io-client:socket');
var index = require('indexof');
var parser = require('engine.io-parser');
var parseuri = require('parseuri');
var parsejson = require('parsejson');
var parseqs = require('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket (uri, opts) {
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' === typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure
    : (global.location && 'https:' === location.protocol);

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port
      ? location.port
      : (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.prevBufferLen = 0;
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  }

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized;
  this.forceNode = !!opts.forceNode;

  // other options for Node.js client
  var freeGlobal = typeof global === 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }

    if (opts.localAddress) {
      this.localAddress = opts.localAddress;
    }
  }

  // set on handshake
  this.id = null;
  this.upgrades = null;
  this.pingInterval = null;
  this.pingTimeout = null;

  // set on heartbeat
  this.pingIntervalTimer = null;
  this.pingTimeoutTimer = null;

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = require('./transport');
Socket.transports = require('./transports/index');
Socket.parser = require('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized,
    perMessageDeflate: this.perMessageDeflate,
    extraHeaders: this.extraHeaders,
    forceNode: this.forceNode,
    localAddress: this.localAddress
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function () {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function (transport) {
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function () {
    self.onDrain();
  })
  .on('packet', function (packet) {
    self.onPacket(packet);
  })
  .on('error', function (e) {
    self.onError(e);
  })
  .on('close', function () {
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 });
  var failed = false;
  var self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen () {
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' === msg.type && 'probe' === msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' === transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' === self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport () {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  // Handle any error that happens while probing
  function onerror (err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose () {
    onerror('transport closed');
  }

  // When the socket is closed while we're probing
  function onclose () {
    onerror('socket closed');
  }

  // When the socket is upgraded while we're probing
  function onupgrade (to) {
    if (transport && to.name !== transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  // Remove all listeners on the transport and on self
  function cleanup () {
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();
};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' === this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' === this.readyState || 'open' === this.readyState ||
      'closing' === this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if ('closed' === this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' === self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api private
*/

Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function () {
    self.emit('ping');
  });
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function () {
  this.writeBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' !== this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, options, fn) {
  if ('function' === typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' === typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' === this.readyState || 'closed' === this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;

  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.readyState = 'closing';

    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function () {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close () {
    self.onClose('forced close');
    debug('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose () {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade () {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);

    // clean buffers after, so users can still
    // grab the buffers on `close` event
    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i < j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./transport":37,"./transports/index":38,"component-emitter":31,"debug":32,"engine.io-parser":14,"indexof":18,"parsejson":22,"parseqs":23,"parseuri":24}],37:[function(require,module,exports){
/**
 * Module dependencies.
 */

var parser = require('engine.io-parser');
var Emitter = require('component-emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
  this.forceNode = opts.forceNode;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;
  this.localAddress = opts.localAddress;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' === this.readyState || '' === this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function (packets) {
  if ('open' === this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function (data) {
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

},{"component-emitter":31,"engine.io-parser":14}],38:[function(require,module,exports){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = require('xmlhttprequest-ssl');
var XHR = require('./polling-xhr');
var JSONP = require('./polling-jsonp');
var websocket = require('./websocket');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling (opts) {
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname !== location.hostname || port !== opts.port;
    xs = opts.secure !== isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling-jsonp":39,"./polling-xhr":40,"./websocket":42,"xmlhttprequest-ssl":43}],39:[function(require,module,exports){
(function (global){

/**
 * Module requirements.
 */

var Polling = require('./polling');
var inherit = require('component-inherit');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function (e) {
    self.onError('jsonp poll error', e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  } else {
    (document.head || document.body).appendChild(script);
  }
  this.script = script;

  var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch (e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function () {
      if (self.iframe.readyState === 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":41,"component-inherit":11}],40:[function(require,module,exports){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = require('xmlhttprequest-ssl');
var Polling = require('./polling');
var Emitter = require('component-emitter');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty () {}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR (opts) {
  Polling.call(this, opts);
  this.requestTimeout = opts.requestTimeout;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname !== global.location.hostname ||
      port !== opts.port;
    this.xs = opts.secure !== isSSL;
  } else {
    this.extraHeaders = opts.extraHeaders;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function (opts) {
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  opts.requestTimeout = this.requestTimeout;

  // other options for Node.js client
  opts.extraHeaders = this.extraHeaders;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function (data, fn) {
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function (err) {
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function () {
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function (data) {
    self.onData(data);
  });
  req.on('error', function (err) {
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request (opts) {
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined !== opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;
  this.requestTimeout = opts.requestTimeout;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function () {
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck(true);
        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' === this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    try {
      xhr.setRequestHeader('Accept', '*/*');
    } catch (e) {}

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.requestTimeout) {
      xhr.timeout = this.requestTimeout;
    }

    if (this.hasXDR()) {
      xhr.onload = function () {
        self.onLoad();
      };
      xhr.onerror = function () {
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function () {
        if (4 !== xhr.readyState) return;
        if (200 === xhr.status || 1223 === xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function () {
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function () {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function () {
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function (data) {
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function (err) {
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function (fromError) {
  if ('undefined' === typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch (e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function () {
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response || this.xhr.responseText;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        try {
          data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
        } catch (e) {
          var ui8Arr = new Uint8Array(this.xhr.response);
          var dataArray = [];
          for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
            dataArray.push(ui8Arr[idx]);
          }

          data = String.fromCharCode.apply(null, dataArray);
        }
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function () {
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function () {
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

Request.requestsCount = 0;
Request.requests = {};

if (global.document) {
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler () {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":41,"component-emitter":31,"component-inherit":11,"debug":32,"xmlhttprequest-ssl":43}],41:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parseqs = require('parseqs');
var parser = require('engine.io-parser');
var inherit = require('component-inherit');
var yeast = require('yeast');
var debug = require('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function () {
  var XMLHttpRequest = require('xmlhttprequest-ssl');
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function () {
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function (onPause) {
  var self = this;

  this.readyState = 'pausing';

  function pause () {
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function () {
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function () {
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function () {
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function (data) {
  var self = this;
  debug('polling got data %s', data);
  var callback = function (packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' === self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' === packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' !== this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' === this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function () {
  var self = this;

  function close () {
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' === this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function (packets) {
  var self = this;
  this.writable = false;
  var callbackfn = function () {
    self.writable = true;
    self.emit('drain');
  };

  parser.encodePayload(packets, this.supportsBinary, function (data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' === schema && Number(this.port) !== 443) ||
     ('http' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

},{"../transport":37,"component-inherit":11,"debug":32,"engine.io-parser":14,"parseqs":23,"xmlhttprequest-ssl":43,"yeast":51}],42:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parser = require('engine.io-parser');
var parseqs = require('parseqs');
var inherit = require('component-inherit');
var yeast = require('yeast');
var debug = require('debug')('engine.io-client:websocket');
var BrowserWebSocket = global.WebSocket || global.MozWebSocket;
var NodeWebSocket;
if (typeof window === 'undefined') {
  try {
    NodeWebSocket = require('ws');
  } catch (e) { }
}

/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or try to resolve WebSocket-compatible
 * interface exposed by `ws` for Node-like environment.
 */

var WebSocket = BrowserWebSocket;
if (!WebSocket && typeof window === 'undefined') {
  WebSocket = NodeWebSocket;
}

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
  if (!this.usingBrowserWebSocket) {
    WebSocket = NodeWebSocket;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function () {
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var uri = this.uri();
  var protocols = void (0);
  var opts = {
    agent: this.agent,
    perMessageDeflate: this.perMessageDeflate
  };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }
  if (this.localAddress) {
    opts.localAddress = this.localAddress;
  }

  try {
    this.ws = this.usingBrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);
  } catch (err) {
    return this.emit('error', err);
  }

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'nodebuffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function () {
  var self = this;

  this.ws.onopen = function () {
    self.onOpen();
  };
  this.ws.onclose = function () {
    self.onClose();
  };
  this.ws.onmessage = function (ev) {
    self.onData(ev.data);
  };
  this.ws.onerror = function (e) {
    self.onError('websocket error', e);
  };
};

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function (packets) {
  var self = this;
  this.writable = false;

  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  var total = packets.length;
  for (var i = 0, l = total; i < l; i++) {
    (function (packet) {
      parser.encodePacket(packet, self.supportsBinary, function (data) {
        if (!self.usingBrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' === typeof data ? global.Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }

        // Sometimes the websocket has already been closed but the browser didn't
        // have a chance of informing us about it yet, in that case send will
        // throw an error
        try {
          if (self.usingBrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e) {
          debug('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done () {
    self.emit('flush');

    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(function () {
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function () {
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function () {
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
    ('ws' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function () {
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../transport":37,"component-inherit":11,"debug":32,"engine.io-parser":14,"parseqs":23,"ws":8,"yeast":51}],43:[function(require,module,exports){
(function (global){
// browser shim for xmlhttprequest module

var hasCORS = require('has-cors');

module.exports = function (opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new global[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
    } catch (e) { }
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"has-cors":17}],44:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000
var m = s * 60
var h = m * 60
var d = h * 24
var y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {}
  var type = typeof val
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str)
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
  if (!match) {
    return
  }
  var n = parseFloat(match[1])
  var type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}

},{}],45:[function(require,module,exports){
(function (global){
/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = require('isarray');
var isBuf = require('./is-buffer');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-buffer":47,"isarray":19}],46:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('socket.io-parser');
var json = require('json3');
var Emitter = require('component-emitter');
var binary = require('./binary');
var isBuf = require('./is-buffer');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'ACK',
  'ERROR',
  'BINARY_EVENT',
  'BINARY_ACK'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    var buf = '';
    while (str.charAt(++i) != '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) != '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    p = tryParse(p, str.substr(i));
  }

  debug('decoded %s as %j', str, p);
  return p;
}

function tryParse(p, str) {
  try {
    p.data = json.parse(str);
  } catch(e){
    return error();
  }
  return p; 
};

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

},{"./binary":45,"./is-buffer":47,"component-emitter":10,"debug":12,"json3":20}],47:[function(require,module,exports){
(function (global){

module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],48:[function(require,module,exports){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

},{}],49:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var workerSources = {};
    resolveSources(skey);

    function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
            var depKey = sources[key][1][depPath];
            if (!workerSources[depKey]) {
                resolveSources(depKey);
            }
        }
    }

    var src = '(' + bundleFn + ')({'
        + Object.keys(workerSources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    if (options && options.bare) { return blob; }
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    worker.objectURL = workerUrl;
    return worker;
};

},{}],50:[function(require,module,exports){
(function (global){
/*! https://mths.be/wtf8 v1.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function wtf8encode(string) {
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte.
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read the first byte.
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid WTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function wtf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var wtf8 = {
		'version': '1.0.0',
		'encode': wtf8encode,
		'decode': wtf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return wtf8;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = wtf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in wtf8) {
				hasOwnProperty.call(wtf8, key) && (freeExports[key] = wtf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.wtf8 = wtf8;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],51:[function(require,module,exports){
'use strict';

var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
  , length = 64
  , map = {}
  , seed = 0
  , i = 0
  , prev;

/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length + map[str.charAt(i)];
  }

  return decoded;
}

/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
  var now = encode(+new Date());

  if (now !== prev) return seed = 0, prev = now;
  return now +'.'+ encode(seed++);
}

//
// Map each character to its index.
//
for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;
yeast.decode = decode;
module.exports = yeast;

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ActorEnvironment = (function () {
    function ActorEnvironment() {
        this.thisRef = null;
    }
    return ActorEnvironment;
}());
exports.ActorEnvironment = ActorEnvironment;

},{}],53:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var commMedium_1 = require("../src/CommMedium");
/**
 * Created by flo on 18/01/2017.
 */
var utils = require("./utils");
var ChannelManager = (function (_super) {
    __extends(ChannelManager, _super);
    function ChannelManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChannelManager.prototype.init = function (messageHandler) {
        _super.prototype.init.call(this, messageHandler);
        this.connections = new Map();
    };
    ChannelManager.prototype.newConnection = function (actorId, channelPort) {
        var _this = this;
        this.connections.set(actorId, channelPort);
        channelPort.onmessage = function (ev) {
            _this.messageHandler.dispatch(JSON.parse(ev.data), ev.ports);
        };
    };
    //Open connection to Node.js instance owning the object to which the far reference refers to
    ChannelManager.prototype.openConnection = function (actorId, actorAddress, actorPort) {
        this.socketHandler.openConnection(actorId, actorAddress, actorPort);
    };
    ChannelManager.prototype.hasConnection = function (actorId) {
        var inChannel = this.connections.has(actorId);
        var connected = this.connectedActors.has(actorId);
        var disconnected = this.socketHandler.disconnectedActors.indexOf(actorId) != -1;
        return inChannel || connected || disconnected;
    };
    ChannelManager.prototype.sendMessage = function (actorId, message, first) {
        if (first === void 0) { first = true; }
        if (this.connections.has(actorId)) {
            this.connections.get(actorId).postMessage(JSON.stringify(message));
        }
        else if (this.connectedActors.has(actorId) || this.socketHandler.disconnectedActors.indexOf(actorId) != -1) {
            this.socketHandler.sendMessage(actorId, message);
        }
        else {
            //Dirty, but it could be that an actor sends a message to the application actor, leading it to spawn a new actor and returning this new reference.
            //Upon receiving this reference the spawning actor immediatly invokes a method on the reference, but hasn't received the open ports message
            if (first) {
                var that = this;
                setTimeout(function () {
                    that.sendMessage(actorId, message, false);
                }, 10);
            }
            else {
                throw new Error("Unable to send message to unknown actor (channel manager): " + actorId + " in : " + this.messageHandler.environment.thisRef.ownerId);
            }
        }
    };
    return ChannelManager;
}(commMedium_1.CommMedium));
exports.ChannelManager = ChannelManager;

},{"./commMedium":70,"./utils":78}],54:[function(require,module,exports){
"use strict";
/**
 * Created by flo on 22/12/2016.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseAllocation = (function () {
    function PromiseAllocation(promise, promiseId) {
        this.promise = promise;
        this.promiseId = promiseId;
    }
    return PromiseAllocation;
}());
exports.PromiseAllocation = PromiseAllocation;
var ForeignPromiseAllocation = (function (_super) {
    __extends(ForeignPromiseAllocation, _super);
    function ForeignPromiseAllocation(promise, promiseId, promiseOwnerId) {
        var _this = _super.call(this, promise, promiseId) || this;
        _this.promiseOwnerId = promiseOwnerId;
        return _this;
    }
    return ForeignPromiseAllocation;
}(PromiseAllocation));
exports.ForeignPromiseAllocation = ForeignPromiseAllocation;
var PromisePool = (function () {
    function PromisePool() {
        this.ids = 0;
        this.promises = new Map();
        this.foreignPromises = new Map();
    }
    PromisePool.prototype.newPromise = function () {
        var res;
        var rej;
        var promId = this.ids;
        var prom = new Promise(function (resolve, reject) {
            res = resolve;
            rej = reject;
        });
        this.promises.set(this.ids, [res, rej]);
        this.ids += 1;
        return new PromiseAllocation(prom, promId);
    };
    PromisePool.prototype.applyForPromise = function (promiseId, arg, funcIndex) {
        if (this.promises.has(promiseId)) {
            this.promises.get(promiseId)[funcIndex](arg);
        }
    };
    PromisePool.prototype.resolvePromise = function (promiseId, value) {
        this.applyForPromise(promiseId, value, 0);
    };
    PromisePool.prototype.rejectPromise = function (promiseId, reason) {
        this.applyForPromise(promiseId, reason, 1);
    };
    PromisePool.prototype.newForeignPromise = function (promiseId, promiseOwnerId) {
        var _this = this;
        var existing = [];
        if (this.foreignPromises.has(promiseOwnerId)) {
            existing = this.foreignPromises.get(promiseOwnerId);
        }
        var prom = new Promise(function (resolve, reject) {
            var alloc = new ForeignPromiseAllocation(prom, promiseId, promiseOwnerId);
            existing.push([alloc, resolve, reject]);
            _this.foreignPromises.set(promiseOwnerId, existing);
        });
        return prom;
    };
    PromisePool.prototype.applyForForeignPromise = function (promiseId, promiseOwnerId, arg, funcIndex) {
        var promises = this.foreignPromises.get(promiseOwnerId);
        promises.forEach(function (alloc) {
            var foreignAlloc = alloc[0];
            if (foreignAlloc.promiseId == promiseId) {
                alloc[funcIndex](arg);
            }
        });
    };
    PromisePool.prototype.resolveForeignPromise = function (promiseId, promiseOwnerId, value) {
        this.applyForForeignPromise(promiseId, promiseOwnerId, value, 1);
    };
    PromisePool.prototype.rejectForeignPromise = function (promiseId, promiseOwnerId, reason) {
        this.applyForForeignPromise(promiseId, promiseOwnerId, reason, 2);
    };
    return PromisePool;
}());
exports.PromisePool = PromisePool;

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var serialisation_1 = require("../serialisation");
/**
 * Created by flo on 22/03/2017.
 */
var Subscription = (function () {
    function Subscription() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.subArray = [];
        this.listeners = [];
        this.onceMode = false;
        this.discovered = 0;
    }
    Subscription.prototype.newPublishedObject = function (publishedObject) {
        this.discovered++;
        this.subArray.push(publishedObject);
        if (this.onceMode) {
            if (!(this.discovered > 1)) {
                this.listeners.forEach(function (callback) {
                    callback(publishedObject);
                });
            }
        }
        else {
            this.listeners.forEach(function (callback) {
                callback(publishedObject);
            });
        }
    };
    Subscription.prototype.each = function (callback) {
        this.listeners.push(callback);
    };
    Subscription.prototype.all = function () {
        return this.subArray;
    };
    Subscription.prototype.once = function (callback) {
        this.onceMode = true;
        this.listeners.push(callback);
    };
    Subscription.prototype.cancel = function () {
        //TODO
    };
    return Subscription;
}());
exports.Subscription = Subscription;
var Publication = (function () {
    function Publication() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
    }
    Publication.prototype.cancel = function () {
        //TODO, How can server identifiy which publiciation to withdraw ? Far ref equality will probably not work
    };
    return Publication;
}());
exports.Publication = Publication;
var PSClient = (function () {
    function PSClient(serverAddress, serverPort, hostActor) {
        if (serverAddress === void 0) { serverAddress = "127.0.0.1"; }
        if (serverPort === void 0) { serverPort = 8000; }
        this.connected = false;
        this.serverAddress = serverAddress;
        this.serverPort = serverPort;
        var that = this;
        this.bufferedMessages = [];
        hostActor.remote(this.serverAddress, this.serverPort).then(function (serverRef) {
            that.serverRef = serverRef;
            that.connected = true;
            if (that.bufferedMessages.length > 0) {
                that.bufferedMessages.forEach(function (f) {
                    f.apply(that, []);
                });
            }
        });
        this.subscriptions = new Map();
    }
    PSClient.prototype.publish = function (object, typeTag) {
        var _this = this;
        if (this.connected) {
            this.serverRef.addPublish(object, typeTag);
        }
        else {
            this.bufferedMessages.push(function () {
                _this.serverRef.addPublish(object, typeTag);
            });
        }
        //TODO return publication object
    };
    PSClient.prototype.subscribe = function (typeTag) {
        var _this = this;
        if (this.connected) {
            this.serverRef.addSubscriber(typeTag, this);
        }
        else {
            this.bufferedMessages.push(function () {
                _this.serverRef.addSubscriber(typeTag, _this);
            });
        }
        var sub = new Subscription();
        if (!this.subscriptions.has(typeTag.tagVal)) {
            this.subscriptions.set(typeTag.tagVal, []);
        }
        this.subscriptions.get(typeTag.tagVal).push(sub);
        return sub;
    };
    PSClient.prototype.newPublished = function (publishedObject, typeTag) {
        //Sure to have at least one subscription, given that server only invokes this method if this actor is in the TypeTag's subscribers list
        this.subscriptions.get(typeTag.tagVal).forEach(function (sub) {
            sub.newPublishedObject(publishedObject);
        });
    };
    return PSClient;
}());
exports.PSClient = PSClient;

},{"../serialisation":75}],56:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 22/03/2017.
 */
var spiders = require('../spiders');
class PSServer {
    constructor(address = "127.0.0.1", port = 8000) {
        this.subscribers = new Map();
        this.published = new Map();
    }
    addPublish(published, typeTag) {
        if (!this.published.has(typeTag.tagVal)) {
            this.published.set(typeTag.tagVal, []);
        }
        this.published.get(typeTag.tagVal).push(published);
        if (this.subscribers.has(typeTag.tagVal)) {
            this.subscribers.get(typeTag.tagVal).forEach((subscriber) => {
                subscriber.newPublished(published, typeTag);
            });
        }
    }
    addSubscriber(typeTag, subReference) {
        if (!this.subscribers.has(typeTag.tagVal)) {
            this.subscribers.set(typeTag.tagVal, []);
        }
        this.subscribers.get(typeTag.tagVal).push(subReference);
        if (this.published.has(typeTag.tagVal)) {
            this.published.get(typeTag.tagVal).forEach((publishedObject) => {
                subReference.newPublished(publishedObject, typeTag);
            });
        }
    }
}
exports.PSServer = PSServer;
/*export class PubSubServer extends spiders.Application{
    private subscribers : Map<string,Array<FarRef>>
    private published   : Map<string,Array<any>>

    constructor(address : string = "127.0.0.1",port : number = 8000){
        super(address,port)
        this.subscribers    = new Map()
        this.published      = new Map()
    }

    addPublish(published,typeTag : PubSubTag){
        if(!this.published.has(typeTag.tagVal)){
            this.published.set(typeTag.tagVal,[])
        }
        this.published.get(typeTag.tagVal).push(published)
        if(this.subscribers.has(typeTag.tagVal)){
            this.subscribers.get(typeTag.tagVal).forEach((subscriber : FarRef)=>{
                subscriber.newPublished(published,typeTag)
            })
        }
    }

    addSubscriber(typeTag : PubSubTag,subReference : FarRef){
        if(!this.subscribers.has(typeTag.tagVal)){
            this.subscribers.set(typeTag.tagVal,[])
        }
        this.subscribers.get(typeTag.tagVal).push(subReference)
        if(this.published.has(typeTag.tagVal)){
            this.published.get(typeTag.tagVal).forEach((publishedObject)=>{
                subReference.newPublished(publishedObject,typeTag)
            })
        }
    }
}*/ 

},{"../spiders":77}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var serialisation_1 = require("../serialisation");
/**
 * Created by flo on 22/03/2017.
 */
var spiders = require("../spiders");
var PubSubTag = (function () {
    function PubSubTag(tagVal) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.tagVal = tagVal;
    }
    PubSubTag.prototype.equals = function (otherTag) {
        otherTag.tagVal == this.tagVal;
    };
    PubSubTag.prototype.toString = function () {
        return this.tagVal;
    };
    return PubSubTag;
}());
exports.PubSubTag = PubSubTag;

},{"../serialisation":75,"../spiders":77}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signal_1 = require("./signal");
var messages_1 = require("../messages");
var serialisation_1 = require("../serialisation");
var NoGlitchFreedom = (function () {
    function NoGlitchFreedom() {
    }
    NoGlitchFreedom.prototype.setSignalPool = function (signalPool) {
        this.signalPool = signalPool;
    };
    NoGlitchFreedom.prototype.propagationReceived = function (fromId, signalId, value) {
        //Could be that the signal was garbage collected (shouldn't happen given the failure model)
        if (this.signalPool.knownSignal(signalId)) {
            //Elm style propagation, signal pool serves as event dispatcher
            this.signalPool.sources.forEach(function (sourceSignal, id) {
                if (id == signalId) {
                    sourceSignal.clock++;
                    sourceSignal.change(value);
                }
                else {
                    sourceSignal.change(signal_1.Signal.NO_CHANGE);
                }
            });
        }
    };
    NoGlitchFreedom.prototype.propagate = function (signal, toId) {
        this.signalPool.environment.commMedium.sendMessage(toId, new messages_1.ExternalSignalChangeMessage(this.signalPool.environment.thisRef, signal.id, serialisation_1.serialise(signal.value, toId, this.signalPool.environment)));
    };
    return NoGlitchFreedom;
}());
exports.NoGlitchFreedom = NoGlitchFreedom;

},{"../messages":73,"../serialisation":75,"./signal":61}],59:[function(require,module,exports){
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialisation_1 = require("../serialisation");
const Queue_1 = require("./Queue");
const signal_1 = require("./signal");
class SourceIsolate {
    constructor(sources) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.sources = sources;
    }
}
class PropagationValue {
    constructor(origin, value, timeStamp) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.origin = origin;
        this.value = value;
        this.timeStamp = timeStamp;
    }
}
class QPROPSourceSignal extends signal_1.SignalObject {
    change(parentVals) {
        this.parentVals = parentVals;
    }
}
__decorate([
    signal_1.mutator
], QPROPSourceSignal.prototype, "change", null);
exports.QPROPSourceSignal = QPROPSourceSignal;
class QPROPNode {
    constructor(ownType, directParents, directChildren, hostActor, defaultVal) {
        this.host = hostActor;
        this.ownType = ownType;
        this.ownSignal = new QPROPSourceSignal();
        this.ownDefault = defaultVal;
        this.directChildren = directChildren;
        this.directParents = directParents;
        this.directChildrenRefs = [];
        this.directParentRefs = [];
        this.directParentLastKnownVals = new Map();
        this.directParentDefaultVals = new Map();
        this.sourceMap = new Map();
        this.propagationPaths = new Map();
        this.inputQueues = new Map();
        this.parentsReceived = 0;
        this.startsReceived = 0;
        this.readyListeners = [];
        this.instabilitySet = new Set();
        this.stampCounter = 0;
        this.dynamic = false;
        hostActor.publish(this, ownType);
        this.pickInit();
    }
    ////////////////////////////////////////
    // Helping function                 ///
    ///////////////////////////////////////
    printInfo() {
        console.log("Info for: " + this.ownType.tagVal);
        /*console.log("Direct Parents: " + this.directParents.length)
        this.directParents.forEach((parent : PubSubTag)=>{
            console.log(parent.tagVal)
        })
        console.log("Direct Children: " + this.directChildren.length)
        this.directChildren.forEach((child : PubSubTag)=>{
            console.log(child.tagVal)
        })*/
        console.log("Queue info:");
        this.inputQueues.forEach((qs, parent) => {
            console.log("Queues for : " + parent);
            qs.forEach((_, source) => {
                console.log("Source: " + source);
            });
        });
    }
    receivedAllParents() {
        return this.parentsReceived == this.directParents.length;
    }
    sendReady() {
        if ((this.startsReceived == this.directChildrenRefs.length) && (this.directParentRefs.length == this.directParents.length) && (this.directChildrenRefs.length != 0)) {
            this.directParentRefs.forEach((parentRef) => {
                parentRef.receiveStart();
            });
            this.readyListeners.forEach((readyListener) => {
                readyListener();
            });
            console.log("Node : " + this.ownType.tagVal + " is ready !");
            this.printInfo();
        }
    }
    sendParents() {
        if (this.receivedAllParents() && (this.directChildrenRefs.length == this.directChildren.length)) {
            this.directChildrenRefs.forEach((childRef) => {
                childRef.receiveParents(this.ownType, this.getAllSources(), this.ownDefault);
            });
            if (this.directChildrenRefs.length == 0 && (this.directParentRefs.length == this.directParents.length)) {
                this.directParentRefs.forEach((parentRef) => {
                    parentRef.receiveStart();
                });
                console.log("Node : " + this.ownType.tagVal + " is ready !");
                this.printInfo();
            }
        }
    }
    getAllSources() {
        let all = [];
        this.sourceMap.forEach((sources) => {
            sources.forEach((source) => {
                if (!all.includes(source)) {
                    all.push(source);
                }
            });
        });
        if (this.directParents.length == 0) {
            all.push(this.ownType);
        }
        return new SourceIsolate(all);
    }
    constructQueue(from, sources) {
        this.sourceMap.set(from.tagVal, sources);
        let allQs = this.inputQueues.get(from.tagVal);
        sources.forEach((source) => {
            allQs.set(source.tagVal, new Queue_1.Queue());
        });
    }
    ////////////////////////////////////////
    // Algorithm                        ///
    ///////////////////////////////////////
    pickInit() {
        //TODO add dynamic behaviour
        this.directParents.forEach((parentType) => {
            this.inputQueues.set(parentType.tagVal, new Map());
        });
        this.initRegular();
    }
    initRegular() {
        this.directParents.forEach((parenType) => {
            this.host.subscribe(parenType).each((parentRef) => {
                this.directParentRefs.push(parentRef);
                this.sendReady();
                if (this.receivedAllParents() && this.directChildren.length == 0) {
                    this.directParentRefs.forEach((parentRef) => {
                        parentRef.receiveStart();
                    });
                }
            });
        });
        this.directChildren.forEach((childType) => {
            this.host.subscribe(childType).each((childRef) => {
                this.directChildrenRefs.push(childRef);
                if ((this.directChildrenRefs.length == this.directChildren.length) && this.directParents.length == 0) {
                    this.directChildrenRefs.forEach((childRef) => {
                        childRef.receiveParents(this.ownType, this.getAllSources(), this.ownDefault);
                    });
                }
                else {
                    this.sendParents();
                }
            });
        });
    }
    canPropagate(messageOrigin) {
    }
    getPropagationArguments(messageOrigin) {
    }
    ////////////////////////////////////////
    // Calls made by other QPROP nodes  ///
    ///////////////////////////////////////
    receiveStart() {
        this.startsReceived++;
        this.sendReady();
    }
    receiveParents(from, sources, defaultValue) {
        this.parentsReceived++;
        this.directParentDefaultVals.set(from.tagVal, defaultValue);
        this.constructQueue(from, sources.sources);
        this.sendParents();
    }
    receiveMessage(from, message) {
        let qSet = this.inputQueues.get(from.tagVal);
        let originQueue = qSet.get(message.origin.tagVal);
        originQueue.enQueue(message);
        this.directParentLastKnownVals.set(from.tagVal, message.value);
        let canPropagate = this.canPropagate(message.origin);
        if (canPropagate) {
            let args = this.getPropagationArguments(message.origin);
            //TODO how to get new value ? No idea which signal this is about ...
            let newVal = undefined;
            this.directChildrenRefs.forEach((childRef) => {
                childRef.receiveMessage(this.ownType, new PropagationValue(message.origin, newVal, message.timeStamp));
            });
        }
    }
    ////////////////////////////////////////
    // Calls made by Spiders.js          ///
    ///////////////////////////////////////
    setSignalPool(signalPool) {
        this.signalPool = signalPool;
    }
    //Called by spiders.js when exported signal must propagate
    propagate(signal, toId) {
        let sendToAll = () => {
            let newVal = signal.value;
            this.directChildrenRefs.forEach((childRef) => {
                childRef.receiveMessage(this.ownType, new PropagationValue(this.ownType, newVal, this.stampCounter));
            });
            this.stampCounter++;
        };
        if (this.startsReceived == this.directChildren.length) {
            sendToAll();
        }
        else {
            this.readyListeners.push(sendToAll);
        }
    }
    //No need to implement this, QPROP overrides this behaviour
    propagationReceived(fromId, signalId, value) {
        //Not needed
    }
}
exports.QPROPNode = QPROPNode;

},{"../serialisation":75,"./Queue":60,"./signal":61}],60:[function(require,module,exports){
/*

Queue.js

A function to represent a queue

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/
Object.defineProperty(exports, "__esModule", { value: true });
class Queue {
    constructor() {
        this.queue = [];
        this.offset = 0;
    }
    getLength() {
        return (this.queue.length - this.offset);
    }
    isEmpty() {
        return this.getLength() == 0;
    }
    enQueue(item) {
        this.queue.push(item);
    }
    deQueue() {
        // if the queue is empty, return immediately
        if (this.queue.length == 0)
            return undefined;
        // store the item at the front of the queue
        var item = this.queue[this.offset];
        // increment the offset and remove the free space if necessary
        if (++this.offset * 2 >= this.queue.length) {
            this.queue = this.queue.slice(this.offset);
            this.offset = 0;
        }
        // return the dequeued item
        return item;
    }
    peek() {
        return this.queue.length > 0 ? this.queue[this.offset] : undefined;
    }
}
exports.Queue = Queue;

},{}],61:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var serialisation_1 = require("../serialisation");
/**
 * Created by flo on 21/06/2017.
 */
var utils = require("../utils");
var Dependency = (function () {
    function Dependency(val, position) {
        this.value = val;
        this.position = position;
    }
    return Dependency;
}());
var SignalDependency = (function (_super) {
    __extends(SignalDependency, _super);
    function SignalDependency(signal, val, position) {
        var _this = _super.call(this, val, position) || this;
        _this.signal = signal;
        return _this;
    }
    return SignalDependency;
}(Dependency));
exports.SignalDependency = SignalDependency;
var StaticDependency = (function (_super) {
    __extends(StaticDependency, _super);
    function StaticDependency() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StaticDependency;
}(Dependency));
//Used to represent the state of a signal, provided to the programmer as "Signal"
var SignalValue = (function () {
    function SignalValue() {
        this[serialisation_1.SignalContainer.checkSignalFuncKey] = true;
    }
    SignalValue.prototype.setHolder = function (holder) {
        this.holder = holder;
    };
    SignalValue.IS_MUTATOR = "_IS_MUTATOR_";
    SignalValue.GET_ORIGINAL = "_GET_ORIGINAL_";
    SignalValue.IS_WRAPPED = "_IS_WRAPPED_";
    SignalValue.LOWER_BOUND = "_LOWER_BOUND_";
    SignalValue.UPPER_BOUND = "_UPPER_BOUND_";
    SignalValue.WEAK_ANN = "_WEAK_ANN_";
    return SignalValue;
}());
exports.SignalValue = SignalValue;
function mutator(target, propertyKey, descriptor) {
    var originalMethod = descriptor.value;
    originalMethod[SignalValue.IS_MUTATOR] = true;
    return {
        value: originalMethod
    };
}
exports.mutator = mutator;
function lease(timeOut) {
    return function boundsDecorator(constructor) {
        return function NewAble() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var sigObject = new (constructor.bind.apply(constructor, [void 0].concat(args)))();
            sigObject[SignalValue.LOWER_BOUND] = timeOut;
            sigObject[SignalValue.UPPER_BOUND] = -1;
            return sigObject;
        };
    };
}
exports.lease = lease;
function weak(constructor) {
    return function NewAble() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var sigObject = new (constructor.bind.apply(constructor, [void 0].concat(args)))();
        sigObject[SignalValue.WEAK_ANN] = true;
        return sigObject;
    };
}
exports.weak = weak;
//strong is the default, so doesn't do anything but there for consistencies sake
function strong(constructor) {
    return constructor;
}
exports.strong = strong;
var SignalObject = (function (_super) {
    __extends(SignalObject, _super);
    function SignalObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SignalObject.prototype.instantiateMeta = function (environment) {
        var _this = this;
        var methodKeys = Reflect.ownKeys(Object.getPrototypeOf(this));
        methodKeys.forEach(function (methodName) {
            var property = Reflect.get(Object.getPrototypeOf(_this), methodName);
            if (property[SignalValue.IS_MUTATOR] || environment.signalPool.isMutator(_this.constructor.name.toString(), methodName.toString())) {
                if (!property[SignalValue.IS_WRAPPED]) {
                    var wrapped = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        property.apply(_this, args, _this);
                        _this.holder.change();
                    };
                    wrapped[SignalValue.IS_MUTATOR] = true;
                    wrapped[SignalValue.GET_ORIGINAL] = property;
                    wrapped[SignalValue.IS_WRAPPED] = true;
                    Object.getPrototypeOf(_this)[methodName] = wrapped;
                }
                else {
                    //Re-wrap (to have correct this pointer)
                    var original_1 = property[SignalValue.GET_ORIGINAL];
                    var wrapped = function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        original_1.apply(_this, args, _this);
                        _this.holder.change();
                    };
                    wrapped[SignalValue.IS_MUTATOR] = true;
                    wrapped[SignalValue.GET_ORIGINAL] = original_1;
                    wrapped[SignalValue.IS_WRAPPED] = true;
                    Object.getPrototypeOf(_this)[methodName] = wrapped;
                }
            }
        });
    };
    return SignalObject;
}(SignalValue));
exports.SignalObject = SignalObject;
var SignalFunction = (function (_super) {
    __extends(SignalFunction, _super);
    function SignalFunction(f) {
        var _this = _super.call(this) || this;
        _this.f = f;
        return _this;
    }
    SignalFunction.prototype.reeval = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.lastVal = this.f.apply(this, args);
        return this.lastVal;
    };
    return SignalFunction;
}(SignalValue));
exports.SignalFunction = SignalFunction;
var Signal = (function () {
    function Signal(signalObject, isGarbage) {
        if (isGarbage === void 0) { isGarbage = false; }
        //this[SignalContainer.checkSignalFuncKey]    = true
        this.id = utils.generateId();
        this.value = signalObject;
        this.children = new Map();
        this.garbageChildren = new Map();
        this.signalDependencies = new Map();
        this.staticDependencies = new Array();
        this.garbageSignalDependencies = new Map();
        this.garbageStaticDependencies = new Array();
        this.changesReceived = 0;
        this.noChangesReceived = 0;
        this.onChangeListeners = new Array();
        this.onDeleteListeners = new Array();
        this.clock = 0;
        this.isGarbage = isGarbage;
        if (Reflect.has(signalObject, SignalValue.LOWER_BOUND)) {
            this.rateLowerBound = signalObject[SignalValue.LOWER_BOUND];
            this.rateUpperBound = signalObject[SignalValue.UPPER_BOUND];
        }
        else {
            this.rateLowerBound = -1;
            this.rateUpperBound = -1;
        }
        this.isSource = true;
        if (Reflect.has(signalObject, SignalValue.WEAK_ANN)) {
            this.strong = false;
            this.tempStrong = false;
        }
        else {
            this.strong = true;
            this.tempStrong = true;
        }
        if (isGarbage) {
            this.strong = false;
            this.tempStrong = false;
        }
    }
    Signal.prototype.addChild = function (signal) {
        this.children.set(signal.id, signal);
    };
    Signal.prototype.addGarbageChild = function (signal) {
        this.garbageChildren.set(signal.id, signal);
    };
    Signal.prototype.removeChild = function (signalId) {
        this.children.delete(signalId);
    };
    Signal.prototype.removeGarbageChild = function (signalId) {
        this.children.delete(signalId);
    };
    Signal.prototype.addSignalDependency = function (signal, position) {
        this.signalDependencies.set(signal.id, new SignalDependency(signal, signal.value, position));
        this.isSource = false;
    };
    Signal.prototype.addStaticDependency = function (value, position) {
        this.staticDependencies.push(new StaticDependency(value, position));
        this.isSource = false;
    };
    Signal.prototype.addGarbageSignalDependency = function (signal, position) {
        this.garbageSignalDependencies.set(signal.id, new SignalDependency(signal, signal.value, position));
    };
    Signal.prototype.addGarbageStaticDependency = function (value, position) {
        this.garbageStaticDependencies.push(new StaticDependency(value, position));
    };
    //Signals is made weak by current actor. In case it is published it must be weak as well (hence tempStrong = false)
    Signal.prototype.makeWeak = function () {
        this.strong = false;
        this.tempStrong = false;
    };
    //Used to indicate that signal should be transferred weakly, but must remain strong for sender
    Signal.prototype.makeTempWeak = function () {
        this.tempStrong = false;
    };
    //Called on source nodes by "external" code
    Signal.prototype.change = function (val) {
        if (val === void 0) { val = null; }
        if (val == Signal.NO_CHANGE) {
            this.propagate(val);
        }
        else if (val instanceof SignalFunction) {
            this.clock++;
            this.value.lastVal = val.lastVal;
            this.propagate(val.lastVal);
            this.triggerExternal();
        }
        else if (val instanceof SignalObject) {
            this.clock++;
            this.value = val;
            this.propagate(this.value);
            this.triggerExternal();
        }
        else {
            this.clock++;
            this.propagate(this.value);
            this.triggerExternal();
        }
    };
    Signal.prototype.propagate = function (val) {
        var _this = this;
        this.children.forEach(function (child) {
            child.parentChanged(_this.id, val);
        });
    };
    Signal.prototype.propagateGarbage = function (val) {
        var _this = this;
        if (val === void 0) { val = undefined; }
        var ret = true;
        this.garbageChildren.forEach(function (child) {
            ret = ret && child.parentGarbageCollected(_this.id, val);
        });
        return ret;
    };
    Signal.prototype.triggerExternal = function () {
        this.onChangeListeners.forEach(function (listener) {
            listener();
        });
    };
    Signal.prototype.parentChanged = function (parentId, val) {
        this.changesReceived += 1;
        var dependency = this.signalDependencies.get(parentId);
        if (val == Signal.NO_CHANGE) {
            this.noChangesReceived += 1;
        }
        else {
            dependency.value = val;
        }
        if (this.changesReceived == this.signalDependencies.size && this.noChangesReceived != this.signalDependencies.size) {
            var args_1 = [];
            this.signalDependencies.forEach(function (dep) {
                args_1[dep.position] = dep.value;
            });
            this.staticDependencies.forEach(function (dep) {
                args_1[dep.position] = dep.value;
            });
            //If the signal has parents it cannot be source and must therefore have a function as value object
            var ret = (_a = this.value).reeval.apply(_a, args_1);
            this.changesReceived = 0;
            this.noChangesReceived = 0;
            this.clock++;
            this.triggerExternal();
            this.propagate(ret);
        }
        else if (this.noChangesReceived == this.signalDependencies.size) {
            this.noChangesReceived = 0;
            this.changesReceived = 0;
            this.propagate(Signal.NO_CHANGE);
        }
        var _a;
    };
    //Return indicates whether propagation happened fully, in which case signal pool will collect all garbage nodes as well
    Signal.prototype.parentGarbageCollected = function (parentId, val) {
        if (val === void 0) { val = undefined; }
        this.changesReceived++;
        if (this.changesReceived == this.garbageSignalDependencies.size) {
            var args_2 = [];
            var dependency = this.garbageSignalDependencies.get(parentId);
            dependency.value = val;
            this.garbageSignalDependencies.forEach(function (dep) {
                //Garbage dependencies do not propagate values (simply propagate the "undefined" event)
                args_2[dep.position] = dep.value;
            });
            this.garbageStaticDependencies.forEach(function (dep) {
                args_2[dep.position] = dep.value;
            });
            var ret = (_a = this.value).reeval.apply(_a, args_2);
            return this.propagateGarbage(ret);
        }
        else {
            return false;
        }
        var _a;
    };
    //Used by Spiders.js to notify remote signals of a change
    Signal.prototype.registerOnChangeListener = function (callback) {
        this.onChangeListeners.push(callback);
    };
    //Used by spiders.js to notify remote signal of garbage collection
    Signal.prototype.registerOnDeleteListener = function (callback) {
        this.onDeleteListeners.push(callback);
    };
    //Trigger garbage collection propagation (notify remote signal of destruction, not garbage value propagation)
    Signal.prototype.triggerOnDelete = function () {
        this.onDeleteListeners.forEach(function (callback) {
            callback();
        });
    };
    Signal.NO_CHANGE = "_NO_CHANGE_";
    return Signal;
}());
exports.Signal = Signal;
function lift(func) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var sig = new Signal(new SignalFunction(func));
        var lowerBound = Infinity;
        var upperBound = -Infinity;
        args.forEach(function (a, i) {
            if (a instanceof SignalValue) {
                a.holder.addChild(sig);
                sig.addSignalDependency(a.holder, i);
                if (a.holder.rateLowerBound > 0) {
                    lowerBound = Math.min(lowerBound, a.holder.rateLowerBound);
                    upperBound = Math.max(upperBound, a.holder.rateUpperBound);
                }
            }
            else {
                sig.addStaticDependency(a, i);
            }
        });
        sig.rateLowerBound = lowerBound;
        sig.rateUpperBound = upperBound;
        return sig;
    };
}
exports.lift = lift;
function liftGarbage(func) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var sig = new Signal(new SignalFunction(func), true);
        sig.rateLowerBound = -1;
        sig.rateUpperBound = -1;
        args.forEach(function (a, i) {
            if (a instanceof SignalValue) {
                a.holder.addGarbageChild(sig);
                sig.addGarbageSignalDependency(a.holder, i);
            }
            else {
                sig.addGarbageStaticDependency(a, i);
            }
        });
        return sig;
    };
}
exports.liftGarbage = liftGarbage;

},{"../serialisation":75,"../utils":78}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../messages");
var NoGlitchFreedom_1 = require("./NoGlitchFreedom");
/**
 * Created by flo on 22/06/2017.
 */
var SignalPool = (function () {
    function SignalPool(environment) {
        this.environment = environment;
        this.signals = new Map();
        this.garbageSignals = new Map();
        this.garbageDependencies = new Map();
        this.sources = new Map();
        this.garbageCollected = new Array();
        this.mutators = new Map();
        this.distAlgo = new NoGlitchFreedom_1.NoGlitchFreedom();
        this.distAlgo.setSignalPool(this);
    }
    SignalPool.prototype.installDPropAlgorithm = function (algoInstance) {
        this.distAlgo = algoInstance;
        this.distAlgo.setSignalPool(this);
    };
    SignalPool.prototype.addMutator = function (className, methodName) {
        if (!this.mutators.has(className)) {
            this.mutators.set(className, []);
        }
        this.mutators.get(className).push(methodName);
    };
    SignalPool.prototype.isMutator = function (className, methodName) {
        return this.mutators.has(className) && this.mutators.get(className).includes(methodName);
    };
    SignalPool.prototype.newSource = function (signal) {
        this.sources.set(signal.id, signal);
        if (signal.rateLowerBound > 0) {
            this.trackLease(signal.id, signal.rateLowerBound);
        }
    };
    SignalPool.prototype.knownSignal = function (signalId) {
        return this.sources.has(signalId) || this.signals.has(signalId);
    };
    SignalPool.prototype.trackLease = function (signalId, bound) {
        var _this = this;
        var signal;
        if (this.sources.has(signalId)) {
            signal = this.sources.get(signalId);
        }
        else {
            signal = this.signals.get(signalId);
        }
        var clockBefore = signal.clock;
        setTimeout(function () {
            var clockAfter = signal.clock;
            if (clockBefore == clockAfter) {
                if (!signal.strong) {
                    //console.log("Garbage collecting")
                    _this.garbageCollect(signal.id);
                }
                else {
                    //console.log("Lease failed but signal is strong so its ok ! ")
                }
            }
            else if (!_this.garbageCollected.includes(signalId)) {
                _this.trackLease(signalId, bound);
            }
        }, bound);
    };
    //Recursively delete all children of the specified head node
    SignalPool.prototype.garbageCollect = function (headId) {
        var _this = this;
        //Node might have been removed by common ancestor
        if (this.signals.has(headId) || this.sources.has(headId)) {
            var head = void 0;
            if (this.sources.has(headId)) {
                head = this.sources.get(headId);
            }
            else {
                head = this.signals.get(headId);
            }
            this.initiateGarbagePropagation(head);
            this.deleteSignal(head);
            head.children.forEach(function (child) {
                _this.garbageCollect(child.id);
            });
        }
    };
    //Garbage collect the garbage dependency graph (i.e. signals triggered by garbage collection of "regular" value signals)
    SignalPool.prototype.garbageCollectGarbage = function (headId) {
        var _this = this;
        var sig = this.garbageSignals.get(headId);
        this.garbageSignals.delete(headId);
        sig.garbageSignalDependencies.forEach(function (dependency) {
            dependency.signal.removeGarbageChild(headId);
        });
        sig.garbageChildren.forEach(function (child) {
            _this.garbageCollectGarbage(child.id);
        });
    };
    SignalPool.prototype.initiateGarbagePropagation = function (signal) {
        var _this = this;
        if (this.garbageDependencies.has(signal.id)) {
            this.garbageDependencies.get(signal.id).forEach(function (garbageId) {
                var destroy = _this.garbageSignals.get(garbageId).parentGarbageCollected(signal.id);
                if (destroy) {
                    _this.garbageCollectGarbage(garbageId);
                }
            });
        }
    };
    SignalPool.prototype.deleteSignal = function (signal) {
        this.signals.delete(signal.id);
        this.sources.delete(signal.id);
        this.garbageCollected.push(signal.id);
        signal.signalDependencies.forEach(function (dependency) {
            dependency.signal.removeChild(signal.id);
        });
        signal.triggerOnDelete();
    };
    SignalPool.prototype.newSignal = function (signal) {
        this.signals.set(signal.id, signal);
        if (signal.rateLowerBound > 0) {
            this.trackLease(signal.id, signal.rateLowerBound);
        }
    };
    SignalPool.prototype.newGarbageSignal = function (signal) {
        this.garbageSignals.set(signal.id, signal);
    };
    SignalPool.prototype.addGarbageDependency = function (regularNodeId, garbageNodeId) {
        if (!this.garbageDependencies.has(regularNodeId)) {
            this.garbageDependencies.set(regularNodeId, new Array());
        }
        this.garbageDependencies.get(regularNodeId).push(garbageNodeId);
    };
    SignalPool.prototype.registerExternalListener = function (signalId, holderId) {
        var _this = this;
        var signal;
        if (this.signals.has(signalId)) {
            signal = this.signals.get(signalId);
        }
        else if (this.sources.has(signalId)) {
            signal = this.sources.get(signalId);
        }
        else {
            throw new Error("Unable to find signal to register listener");
        }
        signal.registerOnChangeListener(function () {
            _this.distAlgo.propagate(signal, holderId);
            //this.environment.commMedium.sendMessage(holderId,new ExternalSignalChangeMessage(this.environment.thisRef,signal.id,serialise(signal.value,holderId,this.environment)))
        });
        signal.registerOnDeleteListener(function () {
            _this.environment.commMedium.sendMessage(holderId, new messages_1.ExternalSignalDeleteMessage(_this.environment.thisRef, signal.id));
        });
    };
    SignalPool.prototype.externalChangeReceived = function (fromId, signalId, val) {
        this.distAlgo.propagationReceived(fromId, signalId, val);
    };
    return SignalPool;
}());
exports.SignalPool = SignalPool;

},{"../messages":73,"./NoGlitchFreedom":58}],63:[function(require,module,exports){
"use strict";
/**
 * Created by flo on 16/03/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../messages");
var Repliq_1 = require("./Repliq");
var Round_1 = require("./Round");
var utils = require("../utils");
var GSP = (function () {
    function GSP(thisActorId, environment) {
        this.thisActorId = thisActorId;
        this.environment = environment;
        //TODO Initialisisation of fields will be refactored together with communication
        this.thisActorAddress = this.environment.thisRef.ownerAddress;
        this.thisActorPort = this.environment.thisRef.ownerPort;
        this.repliqs = new Map();
        this.current = new Map();
        this.pending = new Map();
        this.committed = new Map();
        this.roundNumbers = new Map();
        this.replicaOwners = new Map();
        this.replay = [];
        this.roundCommitListeners = new Map();
        this.forwardingM = new Map();
        this.forwardingS = new Map();
    }
    //Checks whether this instance is master of a given gsp object (using the gsp object's owner id)
    GSP.prototype.isMaster = function (anId) {
        return anId == this.thisActorId;
    };
    GSP.prototype.playRound = function (round) {
        //Replay changes for top-level Repliq
        var object = this.repliqs.get(Round_1.roundMasterObjectId(round));
        var fields = object[Repliq_1.Repliq.getRepliqFields];
        Reflect.ownKeys(Round_1.roundUpdates(round)).forEach(function (fieldName) {
            fields.get(fieldName).update(Reflect.get(Round_1.roundUpdates(round), fieldName));
        });
        //Replay changes for inner Repliqs
        /*let innerObjectIds = Reflect.ownKeys(round.innerUpdates)
        innerObjectIds.forEach((repId)=>{
            if(this.repliqs.has(repId.toString())){
                let rep         = this.repliqs.get(repId.toString())
                let repFields   = rep[Repliq.getRepliqFields]
                Reflect.ownKeys(round.innerUpdates[repId]).forEach((fieldName)=>{
                    repFields.get(fieldName).update(Reflect.get(round.innerUpdates[repId],fieldName))
                })
            }
        })*/
    };
    //////////////////////////////////
    //Methods invoked by Repliqs    //
    //////////////////////////////////
    GSP.prototype.newMasterRepliq = function (repliqProxy, repliqId) {
        this.repliqs.set(repliqId, repliqProxy);
    };
    GSP.prototype.inReplay = function (objectId) {
        return this.replay.includes(objectId);
    };
    GSP.prototype.newRound = function (objectId, ownerId, methodName, args) {
        //Round number will be determined upon Yield by the master
        var roundNumber = -1;
        var listenerID = utils.generateId();
        var round = Round_1.newRound(objectId, ownerId, roundNumber, methodName, args, listenerID);
        this.current.set(objectId, round);
        return round;
    };
    GSP.prototype.registerRoundListener = function (callback, listenerID) {
        if (!this.roundCommitListeners.has(listenerID)) {
            this.roundCommitListeners.set(listenerID, []);
        }
        this.roundCommitListeners.get(listenerID).push(callback);
    };
    //Called at the end of a method invocation on a gsp object
    GSP.prototype.yield = function (objectId, ownerId) {
        if (this.isMaster(ownerId)) {
            this.yieldMasterRound(this.current.get(objectId));
        }
        else {
            this.yieldReplicaRound(this.current.get(objectId));
        }
    };
    GSP.prototype.yieldMasterRound = function (round) {
        var _this = this;
        //Commit round on the master
        if (!this.roundNumbers.has(Round_1.roundMasterObjectId(round))) {
            this.roundNumbers.set(Round_1.roundMasterObjectId(round), 0);
        }
        var prevRoundNumber = this.roundNumbers.get(Round_1.roundMasterObjectId(round));
        Round_1.setRoundNumber(round, prevRoundNumber + 1);
        this.roundNumbers.set(Round_1.roundMasterObjectId(round), prevRoundNumber + 1);
        this.commitRound(round);
        //Broadcast round to all holders of replicaOwners
        if (this.replicaOwners.has(Round_1.roundMasterObjectId(round))) {
            this.replicaOwners.get(Round_1.roundMasterObjectId(round)).forEach(function (replicaHolderId) {
                _this.environment.commMedium.sendMessage(replicaHolderId, new messages_1.GSPRoundMessage(_this.environment.thisRef, round));
            });
        }
    };
    GSP.prototype.yieldReplicaRound = function (round) {
        //A replica just finished performing updates.
        //Add these updates to the pending map and sent the round to the master
        if (!this.pending.has(Round_1.roundMasterObjectId(round))) {
            this.pending.set(Round_1.roundMasterObjectId(round), []);
        }
        this.pending.get(Round_1.roundMasterObjectId(round)).push(round);
        this.environment.commMedium.sendMessage(Round_1.roundMasterOwnerId(round), new messages_1.GSPRoundMessage(this.environment.thisRef, round));
    };
    GSP.prototype.confirmMasterRound = function (round) {
        if (!this.roundNumbers.has(Round_1.roundMasterObjectId(round))) {
            this.roundNumbers.set(Round_1.roundMasterObjectId(round), 0);
        }
        //console.log("Confirming master round: " + roundNumber(round) + " for object id: " + roundMasterObjectId(round))
        //console.log("Last known round: " + this.roundNumbers.get(roundMasterObjectId(round)))
        if (Round_1.roundNumber(round) == this.roundNumbers.get(Round_1.roundMasterObjectId(round)) + 1) {
            //Remove all older pending rounds
            if (this.pending.has(Round_1.roundMasterObjectId(round))) {
                var res = this.pending.get(Round_1.roundMasterObjectId(round)).filter(function (pendingRound) {
                    return Round_1.roundNumber(pendingRound) > Round_1.roundNumber(round);
                });
                this.pending.set(Round_1.roundMasterObjectId(round), res);
            }
            //Commit the round
            this.commitRound(round);
            //Update the last known round number for the replicated object
            this.roundNumbers.set(Round_1.roundMasterObjectId(round), Round_1.roundNumber(round));
        }
        else {
            //We missed a number of rounds, request owner of master object to sync with us
            this.environment.commMedium.sendMessage(Round_1.roundMasterOwnerId(round), new messages_1.GSPSyncMessage(this.environment.thisRef, this.thisActorId, Round_1.roundMasterObjectId(round)));
        }
    };
    GSP.prototype.commitRound = function (round) {
        var _this = this;
        //1) Set concerned object on replay modus (i.e. reset concerned fields to commited values)
        this.replay.push(Round_1.roundMasterObjectId(round));
        var object = this.repliqs.get(Round_1.roundMasterObjectId(round));
        object[Repliq_1.Repliq.resetRepliqCommit](Round_1.roundUpdates(round));
        //reset to commit for inner repliqs
        /*Reflect.ownKeys(round.innerUpdates).forEach((innerId)=>{
            if(this.repliqs.has(innerId.toString())){
                let innerRep = this.repliqs.get(innerId.toString())
                let updates  = round.innerUpdates[innerId]
                innerRep[Repliq.resetRepliqCommit](updates)
            }
        })*/
        //2) Replay the round on the object. Depending on the field implementation this will commit tentative values
        this.playRound(round);
        //3) Commit all tentative values as a result fo the replay
        object[Repliq_1.Repliq.commitRepliq](Round_1.roundUpdates(round));
        //Commit all tentative values of inner Repliqs
        /*Reflect.ownKeys(round.innerUpdates).forEach((innerId)=>{
            if(this.repliqs.has(innerId.toString())){
                let innerRep = this.repliqs.get(innerId.toString())
                let updates  = round.innerUpdates[innerId]
                innerRep[Repliq.commitRepliq](updates)
            }
        })*/
        //4) Play pending rounds
        if (this.pending.has(Round_1.roundMasterObjectId(round))) {
            this.pending.get(Round_1.roundMasterObjectId(round)).forEach(function (round) {
                _this.playRound(round);
            });
        }
        //5) Add round to commit
        if (!this.committed.has(Round_1.roundMasterObjectId(round))) {
            this.committed.set(Round_1.roundMasterObjectId(round), []);
        }
        this.committed.get(Round_1.roundMasterObjectId(round)).push(round);
        this.replay = this.replay.filter(function (oId) {
            oId != Round_1.roundMasterObjectId(round);
        });
        //6) trigger all onceCommited listeners for this round
        this.triggerCommitListeners(Round_1.roundListenerId(round));
    };
    GSP.prototype.triggerCommitListeners = function (listenerID) {
        if (this.roundCommitListeners.has(listenerID)) {
            this.roundCommitListeners.get(listenerID).forEach(function (callback) {
                callback();
            });
        }
    };
    /////////////////////////////////////////////
    //Methods invoked by the network interface //
    /////////////////////////////////////////////
    GSP.prototype.registerReplica = function (replicaId, replica) {
        this.repliqs.set(replicaId, replica);
        this.environment.commMedium.sendMessage(replica[Repliq_1.Repliq.getRepliqOwnerID], new messages_1.GSPRegisterMessage(this.environment.thisRef, this.thisActorId, replicaId, this.thisActorAddress, this.thisActorPort, this.roundNumbers.get(replicaId)));
    };
    GSP.prototype.registerReplicaHolder = function (replicaId, holderId, roundNr) {
        var _this = this;
        if (!this.replicaOwners.has(replicaId)) {
            this.replicaOwners.set(replicaId, []);
        }
        this.replicaOwners.get(replicaId).push(holderId);
        //Added for p2p
        if (this.forwardingM.has(replicaId)) {
            if (!this.forwardingS.has(replicaId)) {
                this.forwardingS.set(replicaId, []);
            }
            this.forwardingS.get(replicaId).push(holderId);
        }
        //
        if (this.committed.has(replicaId) && roundNr < this.roundNumbers.get(replicaId)) {
            this.committed.get(replicaId).forEach(function (round) {
                _this.environment.commMedium.sendMessage(holderId, new messages_1.GSPRoundMessage(_this.environment.thisRef, round));
            });
        }
    };
    GSP.prototype.roundReceived = function (round, senderId) {
        var _this = this;
        if (this.isMaster(Round_1.roundMasterOwnerId(round))) {
            //added for p2p
            if (this.forwardingM.has(Round_1.roundMasterObjectId(round))) {
                Round_1.setRoundMasterOwnerId(round, this.forwardingM.get(Round_1.roundMasterObjectId(round)));
                this.environment.commMedium.sendMessage(this.forwardingM.get(Round_1.roundMasterObjectId(round)), new messages_1.GSPRoundMessage(this.environment.thisRef, round));
            }
            else {
                //
                this.yieldMasterRound(round);
            }
        }
        else {
            //Added for p2p
            if (this.forwardingM.has(Round_1.roundMasterObjectId(round))) {
                //Original master has confirmed a round
                if (senderId == this.forwardingM.get(Round_1.roundMasterObjectId(round))) {
                    this.confirmMasterRound(round);
                    this.forwardingS.get(Round_1.roundMasterObjectId(round)).forEach(function (slaveId) {
                        _this.environment.commMedium.sendMessage(slaveId, new messages_1.GSPRoundMessage(_this.environment.thisRef, round));
                    });
                }
                else {
                    var originalOwner = this.forwardingM.get(Round_1.roundMasterObjectId(round));
                    this.environment.commMedium.sendMessage(originalOwner, new messages_1.GSPRoundMessage(this.environment.thisRef, round));
                }
            }
            else {
                this.confirmMasterRound(round);
            }
        }
    };
    GSP.prototype.receiveSync = function (sender, masterObjectId) {
        var _this = this;
        this.committed.get(masterObjectId).forEach(function (round) {
            _this.environment.commMedium.sendMessage(sender, new messages_1.GSPRoundMessage(_this.environment.thisRef, round));
        });
    };
    GSP.prototype.addForward = function (replicaId, ownerId) {
        this.forwardingM.set(replicaId, ownerId);
    };
    return GSP;
}());
exports.GSP = GSP;

},{"../messages":73,"../utils":78,"./Repliq":64,"./Round":68}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var serialisation_1 = require("../serialisation");
var RepliqPrimitiveField_1 = require("./RepliqPrimitiveField");
var RepliqObjectField_1 = require("./RepliqObjectField");
var Round_1 = require("./Round");
var utils = require("../utils");
/**
 * Created by flo on 16/03/2017.
 */
var RepliqFields = require("./RepliqPrimitiveField");
function atomic(target, propertyKey, descriptor) {
    var originalMethod = descriptor.value;
    originalMethod[Repliq.isAtomic] = true;
    return {
        value: originalMethod
    };
}
exports.atomic = atomic;
var OnceCommited = (function () {
    function OnceCommited(gspInstance, listenerID) {
        this.gspInstance = gspInstance;
        this.listenerID = listenerID;
    }
    OnceCommited.prototype.onceCommited = function (callback) {
        this.gspInstance.registerRoundListener(callback, this.listenerID);
    };
    return OnceCommited;
}());
var isAtomicContext = false;
var atomicRound = null;
var Repliq = (function () {
    function Repliq() {
    }
    Repliq.prototype.isMetaField = function (fieldName) {
        return fieldName == Repliq.getRepliqFields || fieldName == Repliq.getRepliqID || fieldName == Repliq.getRepliqOwnerID || fieldName == Repliq.getRepliqOriginalMethods || fieldName == Repliq.resetRepliqCommit || fieldName == Repliq.commitRepliq || fieldName == serialisation_1.RepliqContainer.checkRepliqFuncKey || fieldName == Repliq.isClientMaster || fieldName == Repliq.getRepliqOwnerPort || fieldName == Repliq.getRepliqOwnerAddress;
    };
    Repliq.prototype.makeAtomicMethodProxyHandler = function (gspInstance, objectId, ownerId, methodName, fields) {
        var that = this;
        return {
            apply: function (target, thisArg, args) {
                var stateChanging = false;
                if (!gspInstance.inReplay(objectId)) {
                    isAtomicContext = true;
                    atomicRound = gspInstance.newRound(objectId, ownerId, methodName, args);
                }
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                var thisProxy = new Proxy(thisArg, {
                    set: function (target, property, value) {
                        var gspField = fields.get(property);
                        if (!gspInstance.inReplay(objectId)) {
                            stateChanging = true;
                            var update = new RepliqPrimitiveField_1.PrimitiveFieldUpdate(property, gspField.read(), value);
                            Round_1.addRoundUpdate(atomicRound, update, objectId);
                        }
                        gspField.writeField(value);
                        return true;
                    },
                    get: function (target, name) {
                        if (fields.has(name)) {
                            var field = fields.get(name);
                            if (field instanceof RepliqObjectField_1.RepliqObjectField) {
                                if (!gspInstance.inReplay(objectId)) {
                                    atomicRound = gspInstance.newRound(objectId, ownerId, methodName, args);
                                }
                                return that.makeObjectFieldProxy(target[name], field, gspInstance.inReplay(objectId), true, atomicRound, objectId, ownerId, gspInstance);
                            }
                            else {
                                return field;
                            }
                        }
                        else {
                            return target[name];
                        }
                    }
                });
                var res = target.apply(thisProxy, args);
                if (!gspInstance.inReplay(objectId)) {
                    gspInstance.yield(objectId, ownerId);
                    var ret = new OnceCommited(gspInstance, Round_1.roundListenerId(atomicRound));
                    isAtomicContext = false;
                    atomicRound = null;
                    return ret;
                }
                else {
                    return res;
                }
            }
        };
    };
    Repliq.prototype.makeMethodProxyHandler = function (gspInstance, objectId, ownerId, methodName, fields) {
        var that = this;
        return {
            apply: function (target, thisArg, args) {
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                var round;
                var stateChanging = false;
                var thisProxy = new Proxy(thisArg, {
                    //Set is only called on primitive fields
                    set: function (target, property, value) {
                        var gspField = fields.get(property);
                        if (!gspInstance.inReplay(objectId)) {
                            stateChanging = true;
                            var update = new RepliqPrimitiveField_1.PrimitiveFieldUpdate(property, gspField.read(), value);
                            if (!isAtomicContext) {
                                round = gspInstance.newRound(objectId, ownerId, methodName, args);
                                Round_1.addRoundUpdate(round, update, objectId);
                                gspInstance.yield(objectId, ownerId);
                            }
                            else {
                                Round_1.addRoundUpdate(atomicRound, update, objectId);
                            }
                        }
                        gspField.writeField(value);
                        return true;
                    },
                    get: function (target, name) {
                        if (fields.has(name)) {
                            var field = fields.get(name);
                            if (field instanceof RepliqObjectField_1.RepliqObjectField) {
                                if (!gspInstance.inReplay(objectId)) {
                                    round = gspInstance.newRound(objectId, ownerId, methodName, args);
                                    stateChanging = true;
                                }
                                return that.makeObjectFieldProxy(target[name], field, gspInstance.inReplay(objectId), false, round, objectId, ownerId, gspInstance);
                            }
                            else {
                                return field;
                            }
                        }
                        else {
                            return target[name];
                        }
                    }
                });
                var res = target.apply(thisProxy, args);
                //The invoked method might not update the Repliq's state
                if (!gspInstance.inReplay(objectId) && stateChanging) {
                    if (isAtomicContext) {
                        return new OnceCommited(gspInstance, Round_1.roundListenerId(atomicRound));
                    }
                    else {
                        return new OnceCommited(gspInstance, Round_1.roundListenerId(round));
                    }
                }
                else {
                    return res;
                }
            }
        };
    };
    Repliq.prototype.makeObjectFieldProxy = function (unwrappedField, field, replay, atomic, round, objectId, ownerId, gspInstance) {
        return new Proxy({}, {
            get: function (target, name) {
                var property = unwrappedField[name];
                if (property instanceof Function) {
                    return new Proxy(property, {
                        apply: function (target, thisArg, args) {
                            if (!replay) {
                                var update = new RepliqObjectField_1.ObjectFieldUpdate(field.name, name.toString(), args);
                                Round_1.addRoundUpdate(round, update, objectId);
                                if (!atomic) {
                                    gspInstance.yield(objectId, ownerId);
                                }
                            }
                            var ret = field.methodInvoked(name.toString(), args);
                            return ret;
                        }
                    });
                }
                else {
                    return property;
                }
            }
        });
    };
    Repliq.prototype.makeProxyHandler = function (fields, originalMethods, objectID, ownerId, isClient, ownerAddress, ownerPort) {
        if (ownerAddress === void 0) { ownerAddress = null; }
        if (ownerPort === void 0) { ownerPort = null; }
        var that = this;
        return {
            set: function (target, property, value, receiver) {
                console.log(property);
                throw new Error("Assignment of Repliq fields not allowed");
            },
            get: function (target, name) {
                if (Reflect.has(target, name) || that.isMetaField(name)) {
                    var property = Reflect.get(target, name);
                    if (typeof property != 'function') {
                        if (name == Repliq.getRepliqID) {
                            return objectID;
                        }
                        else if (name == Repliq.getRepliqOwnerID) {
                            return ownerId;
                        }
                        else if (name == Repliq.getRepliqFields) {
                            return fields;
                        }
                        else if (name == Repliq.getRepliqOriginalMethods) {
                            return originalMethods;
                        }
                        else if (name == Repliq.resetRepliqCommit) {
                            return function (updates) {
                                Reflect.ownKeys(updates).forEach(function (key) {
                                    fields.get(key.toString()).resetToCommit();
                                });
                            };
                        }
                        else if (name == Repliq.commitRepliq) {
                            return function (updates) {
                                Reflect.ownKeys(updates).forEach(function (key) {
                                    fields.get(key.toString()).commit();
                                });
                            };
                        }
                        else if (name == serialisation_1.RepliqContainer.checkRepliqFuncKey) {
                            return true;
                        }
                        else if (name == Repliq.isClientMaster) {
                            return isClient;
                        }
                        else if (name == Repliq.getRepliqOwnerAddress) {
                            return ownerAddress;
                        }
                        else if (name == Repliq.getRepliqOwnerPort) {
                            return ownerPort;
                        }
                        else {
                            var field_1 = fields.get(name);
                            var val = void 0;
                            if (field_1 instanceof RepliqObjectField_1.RepliqObjectField) {
                                val = field_1.read();
                            }
                            else if (field_1[serialisation_1.RepliqContainer.checkRepliqFuncKey]) {
                                return field_1;
                            }
                            else {
                                //Wrap value in an object in order to be able to install onCommit and onTentative listeners
                                val = Object(field_1.read());
                            }
                            Reflect.set(val, "onCommit", function (callback) {
                                field_1.onCommit(callback);
                            });
                            Reflect.set(val, "onTentative", function (callback) {
                                field_1.onTentative(callback);
                            });
                            //TODO for security reasons we could return a proxy in case of a ObjectField which disallows the invocation of methods (i.e. because methods on object fields can only be called from withint a Repliq)
                            return val;
                        }
                    }
                    else {
                        return property;
                    }
                }
                else {
                    return undefined;
                }
            }
        };
    };
    Repliq.prototype.instantiate = function (gspInstance, thisActorId, isClient, ownerAddress, ownerPort) {
        var _this = this;
        if (ownerAddress === void 0) { ownerAddress = null; }
        if (ownerPort === void 0) { ownerPort = null; }
        this[serialisation_1.RepliqContainer.checkRepliqFuncKey] = true;
        var objectToProxy = {};
        var proxyProto = {};
        Object.setPrototypeOf(objectToProxy, proxyProto);
        var fields = new Map();
        var originalMethods = new Map();
        var repliqId = utils.generateId();
        var fieldKeys = Reflect.ownKeys(this);
        var methodKeys = Reflect.ownKeys(Object.getPrototypeOf(this));
        var handler = this.makeProxyHandler(fields, originalMethods, repliqId, thisActorId, isClient, ownerAddress, ownerPort);
        var meta = RepliqFields.fieldMetaData;
        //"Regular" fields are transformed into standard LWR Fields
        fieldKeys.forEach(function (key) {
            var gspField = Reflect.get(_this, key);
            if (meta.has(key)) {
                var fieldClass = meta.get(key);
                gspField = new fieldClass(key, gspField);
            }
            if (!(gspField instanceof RepliqPrimitiveField_1.RepliqPrimitiveField) && !(gspField instanceof RepliqObjectField_1.RepliqObjectField) && !(gspField[serialisation_1.RepliqContainer.checkRepliqFuncKey])) {
                if (gspField instanceof Object) {
                    gspField = new RepliqObjectField_1.RepliqObjectField(key.toString(), gspField);
                }
                else {
                    gspField = new RepliqPrimitiveField_1.RepliqPrimitiveField(key.toString(), gspField);
                }
            }
            fields.set(key.toString(), gspField);
            Reflect.set(objectToProxy, key, gspField);
        });
        //Replace all methods with proxies which intercept apply to log method application
        methodKeys.shift(); // First entry is always constructor method
        methodKeys.forEach(function (key) {
            var property = Reflect.get(Object.getPrototypeOf(_this), key);
            originalMethods.set(key, property);
            var proxyMethod;
            if (property[Repliq.isAtomic]) {
                proxyMethod = new Proxy(property, _this.makeAtomicMethodProxyHandler(gspInstance, repliqId, thisActorId, key.toString(), fields));
            }
            else {
                proxyMethod = new Proxy(property, _this.makeMethodProxyHandler(gspInstance, repliqId, thisActorId, key.toString(), fields));
            }
            Reflect.set(Object.getPrototypeOf(objectToProxy), key, proxyMethod);
        });
        var repliqProxy = new Proxy(objectToProxy, handler);
        gspInstance.newMasterRepliq(repliqProxy, repliqId);
        return repliqProxy;
    };
    Repliq.prototype.reconstruct = function (gspInstance, repliqId, repliqOwnerId, fields, methods, atomicMethods, isClient, ownerAddress, ownerPort, roundNumber) {
        var _this = this;
        if (gspInstance.repliqs.has(repliqId)) {
            return gspInstance.repliqs.get(repliqId);
        }
        else {
            gspInstance.roundNumbers.set(repliqId, roundNumber);
            var objectToProxy_1 = {};
            var protoToProxy_1 = {};
            Object.setPrototypeOf(objectToProxy_1, protoToProxy_1);
            fields.forEach(function (repliqField, fieldName) {
                Reflect.set(objectToProxy_1, fieldName, repliqField);
            });
            methods.forEach(function (method, methodName) {
                var proxyMethod = new Proxy(method, _this.makeMethodProxyHandler(gspInstance, repliqId, repliqOwnerId, methodName, fields));
                Reflect.set(protoToProxy_1, methodName, proxyMethod);
            });
            atomicMethods.forEach(function (method, methodName) {
                method[Repliq.isAtomic] = true;
                var proxyMethod = new Proxy(method, _this.makeAtomicMethodProxyHandler(gspInstance, repliqId, repliqOwnerId, methodName, fields));
                Reflect.set(protoToProxy_1, methodName, proxyMethod);
                //Store the atomic method in regular methods (in case this repliq is serialised again
                methods.set(methodName, method);
            });
            var handler = this.makeProxyHandler(fields, methods, repliqId, repliqOwnerId, isClient, ownerAddress, ownerPort);
            var repliqProxy = new Proxy(objectToProxy_1, handler);
            gspInstance.registerReplica(repliqId, repliqProxy);
            return repliqProxy;
        }
    };
    Repliq.getRepliqFields = "_GET_REPLIQ_FIELDS_";
    Repliq.getRepliqID = "_GET_REPLIQ_ID_";
    Repliq.getRepliqOwnerID = "_GET_REPLIQ_OWNER_ID_";
    Repliq.getRepliqOriginalMethods = "_GET_REPLIQ_ORIGI_METHODS_";
    Repliq.resetRepliqCommit = "_RESET_REPLIQ_";
    Repliq.commitRepliq = "_COMMIT_";
    Repliq.isAtomic = "_IS_ATOMIC_";
    Repliq.isClientMaster = "_IS_CLIENT_MASTER_";
    Repliq.getRepliqOwnerPort = "_GET_REPLIQ_OWNER_PORT_";
    Repliq.getRepliqOwnerAddress = "_GET_REPLIQ_OWNER_ADDRESS_";
    return Repliq;
}());
exports.Repliq = Repliq;

},{"../serialisation":75,"../utils":78,"./RepliqObjectField":66,"./RepliqPrimitiveField":67,"./Round":68}],65:[function(require,module,exports){
"use strict";
/**
 * Created by flo on 30/03/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var FieldUpdate = (function () {
    function FieldUpdate(fieldName) {
        this.fieldName = fieldName;
    }
    return FieldUpdate;
}());
exports.FieldUpdate = FieldUpdate;
var RepliqField = (function () {
    function RepliqField(name) {
        this.commitListeners = [];
        this.tentativeListeners = [];
        this.name = name;
    }
    RepliqField.prototype.resetToCommit = function () {
        this.tentative = this.commited;
    };
    RepliqField.prototype.onCommit = function (callback) {
        this.commitListeners.push(callback);
    };
    RepliqField.prototype.triggerCommit = function () {
        var _this = this;
        this.commitListeners.forEach(function (callback) {
            callback(_this.commited);
        });
    };
    RepliqField.prototype.onTentative = function (callback) {
        this.tentativeListeners.push(callback);
    };
    RepliqField.prototype.triggerTentative = function () {
        var _this = this;
        this.tentativeListeners.forEach(function (callback) {
            callback(_this.tentative);
        });
    };
    return RepliqField;
}());
exports.RepliqField = RepliqField;

},{}],66:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var RepliqField_1 = require("./RepliqField");
/**
 * Created by flo on 30/03/2017.
 */
var ObjectFieldUpdate = (function (_super) {
    __extends(ObjectFieldUpdate, _super);
    function ObjectFieldUpdate(fieldName, methodName, args) {
        var _this = _super.call(this, fieldName) || this;
        _this.methodName = methodName;
        _this.args = args;
        return _this;
    }
    return ObjectFieldUpdate;
}(RepliqField_1.FieldUpdate));
exports.ObjectFieldUpdate = ObjectFieldUpdate;
var RepliqObjectField = (function (_super) {
    __extends(RepliqObjectField, _super);
    function RepliqObjectField(name, value) {
        var _this = _super.call(this, name) || this;
        _this.tentative = value;
        _this.utils = require("../utils");
        _this.commited = _this.utils.clone(value);
        return _this;
    }
    RepliqObjectField.prototype.read = function () {
        return this.tentative;
    };
    RepliqObjectField.prototype.writeField = function (newValue) {
        //TODO should not happen, throw exception
    };
    RepliqObjectField.prototype.methodInvoked = function (methodName, args) {
        (_a = this.tentative)[methodName].apply(_a, args);
        var _a;
    };
    RepliqObjectField.prototype.commit = function () {
        this.commited = this.utils.clone(this.tentative);
        this.triggerCommit();
    };
    RepliqObjectField.prototype.update = function (updates) {
        var _this = this;
        updates.forEach(function (update) {
            _this.methodInvoked(update.methodName, update.args);
        });
        this.triggerTentative();
    };
    return RepliqObjectField;
}(RepliqField_1.RepliqField));
exports.RepliqObjectField = RepliqObjectField;

},{"../utils":78,"./RepliqField":65}],67:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var RepliqField_1 = require("./RepliqField");
/**
 * Created by flo on 16/03/2017.
 */
var PrimitiveFieldUpdate = (function (_super) {
    __extends(PrimitiveFieldUpdate, _super);
    function PrimitiveFieldUpdate(fieldName, initVal, resVal) {
        var _this = _super.call(this, fieldName) || this;
        _this.initVal = initVal;
        _this.resVal = resVal;
        return _this;
    }
    return PrimitiveFieldUpdate;
}(RepliqField_1.FieldUpdate));
exports.PrimitiveFieldUpdate = PrimitiveFieldUpdate;
var RepliqPrimitiveField = (function (_super) {
    __extends(RepliqPrimitiveField, _super);
    function RepliqPrimitiveField(name, value) {
        var _this = _super.call(this, name) || this;
        _this.tentative = value;
        _this.commited = value;
        return _this;
    }
    RepliqPrimitiveField.prototype.read = function () {
        return this.tentative;
    };
    RepliqPrimitiveField.prototype.writeField = function (newValue) {
        this.tentative = newValue;
    };
    RepliqPrimitiveField.prototype.commit = function () {
        this.commited = this.tentative;
        this.triggerCommit();
    };
    RepliqPrimitiveField.prototype.update = function (updates) {
        var _this = this;
        updates.forEach(function (update) {
            _this.tentative = update.resVal;
        });
        this.triggerTentative();
    };
    return RepliqPrimitiveField;
}(RepliqField_1.RepliqField));
exports.RepliqPrimitiveField = RepliqPrimitiveField;
exports.fieldMetaData = new Map();
function makeAnnotation(fieldClass) {
    return function (target, propertyKey) {
        exports.fieldMetaData.set(propertyKey, fieldClass);
    };
}
exports.makeAnnotation = makeAnnotation;
var RepliqCountField = (function (_super) {
    __extends(RepliqCountField, _super);
    function RepliqCountField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RepliqCountField.prototype.update = function (updates) {
        var inc = 0;
        updates.forEach(function (update) {
            inc += (update.resVal - update.initVal);
        });
        this.tentative += inc;
        this.triggerTentative();
    };
    return RepliqCountField;
}(RepliqPrimitiveField));
exports.RepliqCountField = RepliqCountField;
exports.LWR = makeAnnotation(RepliqPrimitiveField);
exports.Count = makeAnnotation(RepliqCountField);

},{"./RepliqField":65}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spiders_1 = require("../spiders");
/**
 * Created by flo on 09/03/2017.
 */
var gspObjectIdIndex = 0;
var masterOwnerIdIndex = 1;
var roundNumberIndex = 2;
var methodNameIndex = 3;
var argsIndex = 4;
var listenerIdIndex = 5;
var updatesIndex = 6;
function newRound(gspObjectId, masterOwnerId, roundNumber, methodName, args, listenerID) {
    var round = [];
    round[gspObjectIdIndex] = gspObjectId;
    round[masterOwnerIdIndex] = masterOwnerId;
    round[roundNumberIndex] = roundNumber;
    round[methodNameIndex] = methodName;
    round[argsIndex] = args;
    round[listenerIdIndex] = listenerID;
    round[updatesIndex] = {};
    return new spiders_1.ArrayIsolate(round);
}
exports.newRound = newRound;
function addRoundUpdate(round, update, forObjectId) {
    //TODO forObjectId used to be part of nested Repliqs implementation
    if (!Reflect.has(round[updatesIndex], update.fieldName)) {
        round[updatesIndex][update.fieldName] = [];
        round.array[updatesIndex][update.fieldName] = [];
    }
    round[updatesIndex][update.fieldName].push(update);
}
exports.addRoundUpdate = addRoundUpdate;
function roundMasterObjectId(round) {
    return round[gspObjectIdIndex];
}
exports.roundMasterObjectId = roundMasterObjectId;
function roundMasterOwnerId(round) {
    return round[masterOwnerIdIndex];
}
exports.roundMasterOwnerId = roundMasterOwnerId;
function setRoundMasterOwnerId(round, newId) {
    round[masterOwnerIdIndex] = newId;
}
exports.setRoundMasterOwnerId = setRoundMasterOwnerId;
function roundNumber(round) {
    return round[roundNumberIndex];
}
exports.roundNumber = roundNumber;
function setRoundNumber(round, newNumber) {
    round[roundNumberIndex] = newNumber;
}
exports.setRoundNumber = setRoundNumber;
function roundMethodName(round) {
    return round[methodNameIndex];
}
exports.roundMethodName = roundMethodName;
function roundArgs(round) {
    return round[argsIndex];
}
exports.roundArgs = roundArgs;
function roundListenerId(round) {
    return round[listenerIdIndex];
}
exports.roundListenerId = roundListenerId;
function roundUpdates(round) {
    return round[updatesIndex];
}
exports.roundUpdates = roundUpdates;
/*export class Round{
    masterOwnerId           : string
    masterObjectId          : ReplicaId
    innerUpdates            : any
    roundNumber             : number
    methodName              : string
    args                    : Array<any>
    updates                 : any
    listenerID              : string

    constructor(gspObjectId : ReplicaId,masterOwnerId : string,roundNumber : number,methodName : string,args : Array<any>,listenerID : string){
        this.masterObjectId         = gspObjectId
        this.innerUpdates           = {}
        this.masterOwnerId          = masterOwnerId
        this.roundNumber            = roundNumber
        this.methodName             = methodName
        this.args                   = args
        this.updates                = {}
        this.listenerID             = listenerID
    }

    addUpdate(update : FieldUpdate,forObjectId : string){
        if(forObjectId == this.masterObjectId){
            if(!Reflect.has(this.updates,update.fieldName)){
                this.updates[update.fieldName] = []
            }
            this.updates[update.fieldName].push(update)
        }
        else{
            if(!Reflect.has(this.innerUpdates,forObjectId)){
                this.innerUpdates[forObjectId] = {}
            }
            if(!Reflect.has(this.innerUpdates[forObjectId],update.fieldName)){
                this.innerUpdates[forObjectId][update.fieldName] = []
            }
            this.innerUpdates[forObjectId][update.fieldName].push(update)
        }
    }
}*/ 

},{"../spiders":77}],69:[function(require,module,exports){
(function (process){
Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
const messageHandler_1 = require("./messageHandler");
const sockets_1 = require("../src/Sockets");
const objectPool_1 = require("../src/ObjectPool");
const farRef_1 = require("../src/FarRef");
const PromisePool_1 = require("./PromisePool");
const serialisation_1 = require("./serialisation");
const ChannelManager_1 = require("./ChannelManager");
const GSP_1 = require("./Replication/GSP");
const signalPool_1 = require("./Reactivivity/signalPool");
const ActorEnvironment_1 = require("./ActorEnvironment");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
var environment;
var messageHandler;
var parentRef;
var thisId;
if (utils.isBrowser()) {
    module.exports = function (self) {
        //At spawning time the actor's behaviour, id and main id are not known. This information will be extracted from an install message handled by the messageHandler (which will make sure this information is set (e.g. in the objectPool)
        environment = new ActorEnvironment_1.ActorEnvironment();
        environment.commMedium = new ChannelManager_1.ChannelManager();
        environment.promisePool = new PromisePool_1.PromisePool();
        environment.objectPool = new objectPool_1.ObjectPool();
        messageHandler = new messageHandler_1.MessageHandler(environment);
        environment.commMedium.init(messageHandler);
        self.addEventListener('message', function (ev) {
            //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
            messageHandler.dispatch(JSON.parse(ev.data), ev.ports);
        });
    };
}
else {
    var loadFromFile = JSON.parse(process.argv[2]);
    var address = process.argv[3];
    var port = parseInt(process.argv[4]);
    thisId = process.argv[5];
    var parentId = process.argv[6];
    var parentPort = parseInt(process.argv[7]);
    environment = new ActorEnvironment_1.ActorEnvironment();
    environment.commMedium = new sockets_1.ServerSocketManager(address, port);
    environment.promisePool = new PromisePool_1.PromisePool();
    environment.objectPool = new objectPool_1.ObjectPool();
    environment.thisRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, thisId, address, port, environment);
    environment.gspInstance = new GSP_1.GSP(thisId, environment);
    environment.signalPool = new signalPool_1.SignalPool(environment);
    var behaviourObject;
    if (loadFromFile) {
        var filePath = process.argv[8];
        var className = process.argv[9];
        var serialisedArgs = JSON.parse(process.argv[10]);
        var constructorArgs = [];
        serialisedArgs.forEach((serArg) => {
            constructorArgs.push(serialisation_1.deserialise(serArg, environment));
        });
        var actorClass = require(filePath)[className];
        behaviourObject = new actorClass();
    }
    else {
        var variables = JSON.parse(process.argv[8]);
        var methods = JSON.parse(process.argv[9]);
        behaviourObject = serialisation_1.reconstructBehaviour({}, variables, methods, environment);
        //reconstructStatic(behaviourObject,JSON.parse(process.argv[10]),thisRef,promisePool,socketManager,objectPool,gspInstance)
    }
    environment.objectPool.installBehaviourObject(behaviourObject);
    messageHandler = new messageHandler_1.MessageHandler(environment);
    environment.commMedium.init(messageHandler);
    parentRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, parentId, address, parentPort, environment);
    var parentServer = parentRef;
    environment.commMedium.openConnection(parentServer.ownerId, parentServer.ownerAddress, parentServer.ownerPort);
    utils.installSTDLib(false, parentRef, behaviourObject, environment);
}

}).call(this,require('_process'))
},{"./ActorEnvironment":52,"./ChannelManager":53,"./PromisePool":54,"./Reactivivity/signalPool":62,"./Replication/GSP":63,"./farRef":71,"./messageHandler":72,"./objectPool":74,"./serialisation":75,"./sockets":76,"./utils":78,"_process":25}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../src/Message");
var farRef_1 = require("../src/FarRef");
var sockets_1 = require("../src/Sockets");
/**
 * Created by flo on 17/01/2017.
 */
var CommMedium = (function () {
    function CommMedium() {
        this.pendingActors = new Map();
        this.connectedActors = new Map();
        this.pendingConnectionId = 0;
        this.socketHandler = new sockets_1.SocketHandler(this);
    }
    CommMedium.prototype.init = function (messageHandler) {
        this.messageHandler = messageHandler;
    };
    //Called whenever a server far reference is passed around between actors.
    //Given that at this point the id of the server is known (in contrast to when "remote" is called, we can simply open up a port to the server and mark the socket as "disconnected" using the actor id
    CommMedium.prototype.connectTransientRemote = function (sender, toServerRef, promisePool) {
        this.connectRemote(sender, toServerRef.ownerAddress, toServerRef.ownerPort, promisePool);
        this.socketHandler.addDisconnected(toServerRef.ownerId);
    };
    CommMedium.prototype.connectRemote = function (sender, address, port, promisePool) {
        var _this = this;
        var promiseAllocation = promisePool.newPromise();
        var connection = require('socket.io-client')('http://' + address + ":" + port);
        var connectionId = this.pendingConnectionId;
        this.pendingActors.set(connectionId, connection);
        this.pendingConnectionId += 1;
        connection.on('connect', function () {
            connection.emit('message', new messages_1.ConnectRemoteMessage(sender, promiseAllocation.promiseId, connectionId));
        });
        connection.on('message', function (data) {
            if (sender instanceof farRef_1.ServerFarReference) {
                _this.messageHandler.dispatch(data);
            }
            else {
                _this.messageHandler.dispatch(JSON.parse(data));
            }
        });
        return promiseAllocation.promise;
    };
    CommMedium.prototype.resolvePendingConnection = function (actorId, connectionId) {
        var connection = this.pendingActors.get(connectionId);
        this.socketHandler.removeFromDisconnected(actorId, connection);
        this.connectedActors.set(actorId, connection);
    };
    return CommMedium;
}());
exports.CommMedium = CommMedium;

},{"./farRef":71,"./messages":73,"./sockets":76,"socket.io-client":26}],71:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../src/Message");
var serialisation_1 = require("./serialisation");
/**
 * Created by flo on 21/12/2016.
 */
var FarReference = (function () {
    function FarReference(objectId, ownerId, environment, isServer) {
        this.ownerId = ownerId;
        this.objectId = objectId;
        this.environemnt = environment;
        this.isServer = isServer;
    }
    FarReference.prototype.sendFieldAccess = function (fieldName) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        this.environemnt.commMedium.sendMessage(this.ownerId, new messages_1.FieldAccessMessage(this.environemnt.thisRef, this.objectId, fieldName, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    };
    FarReference.prototype.sendMethodInvocation = function (methodName, args) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        this.environemnt.commMedium.sendMessage(this.ownerId, new messages_1.MethodInvocationMessage(this.environemnt.thisRef, this.objectId, methodName, args, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    };
    FarReference.prototype.proxyify = function () {
        var baseObject = this;
        return new Proxy({}, {
            get: function (target, property) {
                //Ugly but needed to acquire the proxied far reference
                if (property == FarReference.farRefAccessorKey) {
                    return baseObject;
                }
                else if (property == FarReference.ClientProxyTypeKey) {
                    return !(baseObject.isServer);
                }
                else if (property == FarReference.ServerProxyTypeKey) {
                    return baseObject.isServer;
                }
                else {
                    //Given that a proxified far reference is actually also a promise we need to make sure that JS does not accidentally pipeline the far reference in a chain of promises
                    if (property.toString() != "then" && property.toString() != "catch") {
                        //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                        var prom = baseObject.sendFieldAccess(property.toString());
                        var ret = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            var serialisedArgs = args.map(function (arg) {
                                return serialisation_1.serialise(arg, baseObject.ownerId, baseObject.environemnt);
                            });
                            return baseObject.sendMethodInvocation(property.toString(), serialisedArgs);
                        };
                        ret["then"] = function (onFull, onRej) {
                            return prom.then(onFull, onRej);
                        };
                        ret["catch"] = function (onRej) {
                            return prom.catch(onRej);
                        };
                        ret[FarReference.proxyWrapperAccessorKey] = true;
                        return ret;
                    }
                }
            }
        });
    };
    FarReference.farRefAccessorKey = "_FAR_REF_";
    FarReference.proxyWrapperAccessorKey = "_PROXY_WRAPPER_";
    FarReference.ServerProxyTypeKey = "SPIDER_SERVER_TYPE";
    FarReference.ClientProxyTypeKey = "SPIDER_CLIENT_TYPE";
    return FarReference;
}());
exports.FarReference = FarReference;
var ClientFarReference = (function (_super) {
    __extends(ClientFarReference, _super);
    function ClientFarReference(objectId, ownerId, mainId, environment, contactId, contactAddress, contactPort) {
        if (contactId === void 0) { contactId = null; }
        if (contactAddress === void 0) { contactAddress = null; }
        if (contactPort === void 0) { contactPort = null; }
        var _this = _super.call(this, objectId, ownerId, environment, false) || this;
        _this.mainId = mainId;
        _this.contactId = contactId;
        _this.contactAddress = contactAddress;
        _this.contactPort = contactPort;
        return _this;
    }
    ClientFarReference.prototype.sendRoute = function (toId, msg) {
        if (!this.environemnt.commMedium.hasConnection(this.contactId)) {
            this.environemnt.commMedium.openConnection(this.contactId, this.contactAddress, this.contactPort);
        }
        //TODO quick fix, need to refactor to make sure that message contains the correct contact info (needed to produce return values)
        msg.contactId = this.contactId;
        msg.contactAddress = this.contactAddress;
        msg.contactPort = this.contactPort;
        this.environemnt.commMedium.sendMessage(this.contactId, new messages_1.RouteMessage(this, this.ownerId, msg));
    };
    ClientFarReference.prototype.send = function (toId, msg) {
        var holderRef = this.environemnt.thisRef;
        if (holderRef instanceof ServerFarReference) {
            if (holderRef.ownerId == this.contactId) {
                this.environemnt.commMedium.sendMessage(toId, msg);
            }
            else {
                this.sendRoute(this.contactId, msg);
            }
        }
        else {
            if (holderRef.mainId == this.mainId) {
                this.environemnt.commMedium.sendMessage(this.ownerId, msg);
            }
            else {
                this.sendRoute(this.contactId, msg);
            }
        }
    };
    ClientFarReference.prototype.sendFieldAccess = function (fieldName) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        var message = new messages_1.FieldAccessMessage(this.environemnt.thisRef, this.objectId, fieldName, promiseAlloc.promiseId);
        this.send(this.ownerId, message);
        return promiseAlloc.promise;
    };
    ClientFarReference.prototype.sendMethodInvocation = function (methodName, args) {
        var promiseAlloc = this.environemnt.promisePool.newPromise();
        var message = new messages_1.MethodInvocationMessage(this.environemnt.thisRef, this.objectId, methodName, args, promiseAlloc.promiseId);
        this.send(this.ownerId, message);
        return promiseAlloc.promise;
    };
    return ClientFarReference;
}(FarReference));
exports.ClientFarReference = ClientFarReference;
var ServerFarReference = (function (_super) {
    __extends(ServerFarReference, _super);
    function ServerFarReference(objectId, ownerId, ownerAddress, ownerPort, environment) {
        var _this = _super.call(this, objectId, ownerId, environment, true) || this;
        _this.ownerAddress = ownerAddress;
        _this.ownerPort = ownerPort;
        return _this;
    }
    return ServerFarReference;
}(FarReference));
exports.ServerFarReference = ServerFarReference;

},{"./messages":73,"./serialisation":75}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../src/Message");
var objectPool_1 = require("../src/ObjectPool");
var serialisation_1 = require("./serialisation");
var farRef_1 = require("../src/FarRef");
var GSP_1 = require("./Replication/GSP");
var signalPool_1 = require("./Reactivivity/signalPool");
/**
 * Created by flo on 20/12/2016.
 */
var utils = require('./utils');
var MessageHandler = (function () {
    function MessageHandler(environment) {
        this.environment = environment;
    }
    MessageHandler.prototype.sendReturnServer = function (actorId, actorAddress, actorPort, msg) {
        var commMedium = this.environment.commMedium;
        if (!(commMedium.hasConnection(actorId))) {
            commMedium.openConnection(actorId, actorAddress, actorPort);
        }
        commMedium.sendMessage(actorId, msg);
    };
    MessageHandler.prototype.sendReturnClient = function (actorId, originalMsg, returnMsg) {
        var thisRef = this.environment.thisRef;
        var commMedium = this.environment.commMedium;
        if (thisRef instanceof farRef_1.ClientFarReference) {
            //Message to which actor is replying came from a different client host, send routing message to contact server actor
            if (thisRef.mainId != originalMsg.senderMainId) {
                this.sendReturnServer(originalMsg.contactId, originalMsg.contactAddress, originalMsg.contactPort, new messages_1.RouteMessage(this.environment.thisRef, actorId, returnMsg));
            }
            else {
                commMedium.sendMessage(actorId, returnMsg);
            }
        }
        else {
            commMedium.sendMessage(actorId, returnMsg);
        }
    };
    //Only received as first message by a web worker (i.e. newly spawned client side actor)
    MessageHandler.prototype.handleInstall = function (msg, ports) {
        var thisId = msg.actorId;
        var mainId = msg.mainId;
        this.environment.thisRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, thisId, mainId, this.environment);
        this.environment.gspInstance = new GSP_1.GSP(thisId, this.environment);
        var behaviourObject = serialisation_1.reconstructBehaviour({}, msg.vars, msg.methods, this.environment);
        serialisation_1.reconstructStatic(behaviourObject, msg.staticProperties, this.environment);
        var otherActorIds = msg.otherActorIds;
        this.environment.objectPool = new objectPool_1.ObjectPool(behaviourObject);
        var parentRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, mainId, mainId, this.environment);
        var channelManag = this.environment.commMedium;
        this.environment.signalPool = new signalPool_1.SignalPool(this.environment);
        var mainPort = ports[0];
        channelManag.newConnection(mainId, mainPort);
        otherActorIds.forEach(function (id, index) {
            //Ports at position 0 contains main channel (i.e. channel used to communicate with application actor)
            channelManag.newConnection(id, ports[index + 1]);
        });
        utils.installSTDLib(false, parentRef, behaviourObject, this.environment);
    };
    MessageHandler.prototype.handleOpenPort = function (msg, port) {
        var channelManager = this.environment.commMedium;
        channelManager.newConnection(msg.actorId, port);
    };
    MessageHandler.prototype.handleFieldAccess = function (msg) {
        var targetObject = this.environment.objectPool.getObject(msg.objectId);
        var fieldVal = Reflect.get(targetObject, msg.fieldName);
        //Due to JS' crappy meta API actor might receive field access as part of a method invocation (see farRef implementation)
        if (typeof fieldVal != 'function') {
            var serialised = serialisation_1.serialise(fieldVal, msg.senderId, this.environment);
            var message = new messages_1.ResolvePromiseMessage(this.environment.thisRef, msg.promiseId, serialised);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        }
    };
    MessageHandler.prototype.handleMethodInvocation = function (msg) {
        var _this = this;
        var targetObject = this.environment.objectPool.getObject(msg.objectId);
        var methodName = msg.methodName;
        var args = msg.args;
        var deserialisedArgs = args.map(function (arg) {
            return serialisation_1.deserialise(arg, _this.environment);
        });
        var retVal;
        try {
            retVal = targetObject[methodName].apply(targetObject, deserialisedArgs);
            //retVal = targetObject[methodName](...deserialisedArgs)
            var serialised = serialisation_1.serialise(retVal, msg.senderId, this.environment);
            var message = new messages_1.ResolvePromiseMessage(this.environment.thisRef, msg.promiseId, serialised);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        }
        catch (reason) {
            console.log("Went wrong for : " + methodName);
            var serialised = serialisation_1.serialise(reason, msg.senderId, this.environment);
            message = new messages_1.RejectPromiseMessage(this.environment.thisRef, msg.promiseId, serialised);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        }
    };
    MessageHandler.prototype.handlePromiseResolve = function (msg) {
        var promisePool = this.environment.promisePool;
        var deSerialised = serialisation_1.deserialise(msg.value, this.environment);
        if (msg.foreign) {
            promisePool.resolveForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            promisePool.resolvePromise(msg.promiseId, deSerialised);
        }
    };
    MessageHandler.prototype.handlePromiseReject = function (msg) {
        var promisePool = this.environment.promisePool;
        var deSerialised = serialisation_1.deserialise(msg.reason, this.environment);
        if (msg.foreign) {
            promisePool.rejectForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            promisePool.rejectPromise(msg.promiseId, deSerialised);
        }
    };
    //Can only be received by a server actor
    MessageHandler.prototype.handleConnectRemote = function (msg, clientSocket) {
        var resolveMessage = new messages_1.ResolveConnectionMessage(this.environment.thisRef, msg.promiseId, msg.connectionId);
        if (msg.senderType == messages_1.Message.serverSenderType) {
            this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, resolveMessage);
        }
        else {
            var socketManager = this.environment.commMedium;
            socketManager.addNewClient(msg.senderId, clientSocket);
            this.sendReturnClient(msg.senderId, msg, resolveMessage);
        }
    };
    MessageHandler.prototype.handleResolveConnection = function (msg) {
        this.environment.commMedium.resolvePendingConnection(msg.senderId, msg.connectionId);
        var farRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, msg.senderId, msg.senderAddress, msg.senderPort, this.environment);
        this.environment.promisePool.resolvePromise(msg.promiseId, farRef.proxyify());
    };
    MessageHandler.prototype.handleRoute = function (msg) {
        var _this = this;
        //TODO temp fix , works but should be refactored
        if (msg.message.typeTag == messages_1._METHOD_INVOC_) {
            var args = msg.message.args;
            args.forEach(function (valContainer) {
                if (valContainer.type == serialisation_1.ValueContainer.clientFarRefType) {
                    var container = valContainer;
                    if (container.contactId == null) {
                        var thisRef = _this.environment.thisRef;
                        container.contactId = thisRef.ownerId;
                        container.contactAddress = thisRef.ownerAddress;
                        container.contactPort = thisRef.ownerPort;
                    }
                }
            });
        }
        this.environment.commMedium.sendMessage(msg.targetId, msg.message);
    };
    MessageHandler.prototype.handleGSPRound = function (msg) {
        this.environment.gspInstance.roundReceived(msg.round, msg.senderId);
    };
    MessageHandler.prototype.handleGSPSync = function (msg) {
        this.environment.gspInstance.receiveSync(msg.requesterId, msg.repliqId);
    };
    MessageHandler.prototype.handleGSPRegister = function (msg) {
        var commMedium = this.environment.commMedium;
        if (!commMedium.hasConnection(msg.holderId)) {
            commMedium.openConnection(msg.holderId, msg.holderAddress, msg.holderPort);
        }
        this.environment.gspInstance.registerReplicaHolder(msg.replicaId, msg.holderId, msg.roundNr);
    };
    MessageHandler.prototype.handleRegisterExternalSignal = function (msg) {
        var commMedium = this.environment.commMedium;
        if (!commMedium.hasConnection(msg.requesterId)) {
            commMedium.openConnection(msg.requesterId, msg.requesterAddress, msg.requesterPort);
        }
        //console.log("External listener added for signal: " + msg.signalId + " from : " + msg.requesterId)
        this.environment.signalPool.registerExternalListener(msg.signalId, msg.requesterId);
    };
    MessageHandler.prototype.handleExternalSignalChange = function (msg) {
        //console.log("External signal changed received")
        var newVal = serialisation_1.deserialise(msg.newVal, this.environment);
        this.environment.signalPool.externalChangeReceived(msg.senderId, msg.signalId, newVal);
        //this.environment.signalPool.sourceChanged(msg.signalId,newVal)
    };
    MessageHandler.prototype.handleExternalSignalDelete = function (msg) {
        this.environment.signalPool.garbageCollect(msg.signalId);
    };
    //Ports are needed for client side actor communication and cannot be serialised together with message objects (is always empty for server-side code)
    //Client socket is provided by server-side implementation and is used whenever a client connects remotely to a server actor
    MessageHandler.prototype.dispatch = function (msg, ports, clientSocket) {
        if (ports === void 0) { ports = []; }
        if (clientSocket === void 0) { clientSocket = null; }
        switch (msg.typeTag) {
            case messages_1._INSTALL_BEHAVIOUR_:
                this.handleInstall(msg, ports);
                break;
            case messages_1._OPEN_PORT_:
                this.handleOpenPort(msg, ports[0]);
                break;
            case messages_1._FIELD_ACCESS_:
                this.handleFieldAccess(msg);
                break;
            case messages_1._METHOD_INVOC_:
                this.handleMethodInvocation(msg);
                break;
            case messages_1._RESOLVE_PROMISE_:
                this.handlePromiseResolve(msg);
                break;
            case messages_1._REJECT_PROMISE_:
                this.handlePromiseReject(msg);
                break;
            case messages_1._CONNECT_REMOTE_:
                this.handleConnectRemote(msg, clientSocket);
                break;
            case messages_1._RESOLVE_CONNECTION_:
                this.handleResolveConnection(msg);
                break;
            case messages_1._ROUTE_:
                this.handleRoute(msg);
                break;
            case messages_1._GSP_ROUND_:
                this.handleGSPRound(msg);
                break;
            case messages_1._GSP_SYNC_:
                this.handleGSPSync(msg);
                break;
            case messages_1._GSP_REGISTER_:
                this.handleGSPRegister(msg);
                break;
            case messages_1._REGISTER_EXTERNAL_SIGNAL_:
                this.handleRegisterExternalSignal(msg);
                break;
            case messages_1._EXTERNAL_SIGNAL_CHANGE_:
                this.handleExternalSignalChange(msg);
                break;
            case messages_1._EXTERNAL_SIGNAL_DELETE_:
                this.handleExternalSignalDelete(msg);
                break;
            default:
                throw "Unknown message in actor : " + msg.toString();
        }
    };
    return MessageHandler;
}());
exports.MessageHandler = MessageHandler;

},{"./Reactivivity/signalPool":62,"./Replication/GSP":63,"./farRef":71,"./messages":73,"./objectPool":74,"./serialisation":75,"./utils":78}],73:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var farRef_1 = require("../src/FarRef");
var Message = (function () {
    function Message(typeTag, senderRef) {
        this.typeTag = typeTag;
        this.senderId = senderRef.ownerId;
        if (senderRef instanceof farRef_1.ServerFarReference) {
            this.senderType = Message.serverSenderType;
            this.senderAddress = senderRef.ownerAddress;
            this.senderPort = senderRef.ownerPort;
        }
        else {
            var clientRef = senderRef;
            this.senderType = Message.clientSenderType;
            this.senderMainId = clientRef.mainId;
            this.contactId = clientRef.contactId;
            this.contactAddress = clientRef.contactAddress;
            this.contactPort = clientRef.contactPort;
        }
    }
    Message.serverSenderType = "_SERVER_";
    Message.clientSenderType = "_CLIENT_";
    return Message;
}());
exports.Message = Message;
exports._INSTALL_BEHAVIOUR_ = 0;
var InstallBehaviourMessage = (function (_super) {
    __extends(InstallBehaviourMessage, _super);
    function InstallBehaviourMessage(senderRef, mainId, actorId, vars, methods, staticProperties, otherActorIds) {
        var _this = _super.call(this, exports._INSTALL_BEHAVIOUR_, senderRef) || this;
        _this.mainId = mainId;
        _this.actorId = actorId;
        _this.vars = vars;
        _this.methods = methods;
        _this.staticProperties = staticProperties;
        _this.otherActorIds = otherActorIds;
        return _this;
    }
    return InstallBehaviourMessage;
}(Message));
exports.InstallBehaviourMessage = InstallBehaviourMessage;
exports._FIELD_ACCESS_ = 1;
var FieldAccessMessage = (function (_super) {
    __extends(FieldAccessMessage, _super);
    function FieldAccessMessage(senderRef, objectId, fieldName, promiseId) {
        var _this = _super.call(this, exports._FIELD_ACCESS_, senderRef) || this;
        _this.objectId = objectId;
        _this.fieldName = fieldName;
        _this.promiseId = promiseId;
        return _this;
    }
    return FieldAccessMessage;
}(Message));
exports.FieldAccessMessage = FieldAccessMessage;
exports._METHOD_INVOC_ = 2;
var MethodInvocationMessage = (function (_super) {
    __extends(MethodInvocationMessage, _super);
    function MethodInvocationMessage(senderRef, objectId, methodName, args, promiseId) {
        var _this = _super.call(this, exports._METHOD_INVOC_, senderRef) || this;
        _this.objectId = objectId;
        _this.methodName = methodName;
        _this.args = args;
        _this.promiseId = promiseId;
        return _this;
    }
    return MethodInvocationMessage;
}(Message));
exports.MethodInvocationMessage = MethodInvocationMessage;
exports._RESOLVE_PROMISE_ = 3;
var ResolvePromiseMessage = (function (_super) {
    __extends(ResolvePromiseMessage, _super);
    function ResolvePromiseMessage(senderRef, promiseId, value, foreign) {
        if (foreign === void 0) { foreign = false; }
        var _this = _super.call(this, exports._RESOLVE_PROMISE_, senderRef) || this;
        _this.promiseId = promiseId;
        _this.value = value;
        _this.foreign = foreign;
        return _this;
    }
    return ResolvePromiseMessage;
}(Message));
exports.ResolvePromiseMessage = ResolvePromiseMessage;
exports._REJECT_PROMISE_ = 4;
var RejectPromiseMessage = (function (_super) {
    __extends(RejectPromiseMessage, _super);
    function RejectPromiseMessage(senderRef, promiseId, reason, foreign) {
        if (foreign === void 0) { foreign = false; }
        var _this = _super.call(this, exports._REJECT_PROMISE_, senderRef) || this;
        _this.promiseId = promiseId;
        _this.reason = reason;
        _this.foreign = foreign;
        return _this;
    }
    return RejectPromiseMessage;
}(Message));
exports.RejectPromiseMessage = RejectPromiseMessage;
exports._OPEN_PORT_ = 5;
var OpenPortMessage = (function (_super) {
    __extends(OpenPortMessage, _super);
    function OpenPortMessage(senderRef, actorId) {
        var _this = _super.call(this, exports._OPEN_PORT_, senderRef) || this;
        _this.actorId = actorId;
        return _this;
    }
    return OpenPortMessage;
}(Message));
exports.OpenPortMessage = OpenPortMessage;
exports._CONNECT_REMOTE_ = 6;
var ConnectRemoteMessage = (function (_super) {
    __extends(ConnectRemoteMessage, _super);
    function ConnectRemoteMessage(senderRef, promiseId, connectionId) {
        var _this = _super.call(this, exports._CONNECT_REMOTE_, senderRef) || this;
        _this.promiseId = promiseId;
        _this.connectionId = connectionId;
        return _this;
    }
    return ConnectRemoteMessage;
}(Message));
exports.ConnectRemoteMessage = ConnectRemoteMessage;
exports._RESOLVE_CONNECTION_ = 7;
var ResolveConnectionMessage = (function (_super) {
    __extends(ResolveConnectionMessage, _super);
    function ResolveConnectionMessage(senderRef, promiseId, connectionId) {
        var _this = _super.call(this, exports._RESOLVE_CONNECTION_, senderRef) || this;
        _this.promiseId = promiseId;
        _this.connectionId = connectionId;
        return _this;
    }
    return ResolveConnectionMessage;
}(Message));
exports.ResolveConnectionMessage = ResolveConnectionMessage;
exports._ROUTE_ = 8;
var RouteMessage = (function (_super) {
    __extends(RouteMessage, _super);
    function RouteMessage(senderRef, targetId, message) {
        var _this = _super.call(this, exports._ROUTE_, senderRef) || this;
        _this.message = message;
        _this.targetId = targetId;
        return _this;
    }
    return RouteMessage;
}(Message));
exports.RouteMessage = RouteMessage;
//TODO address and port will be removed once communication refactor is done
exports._GSP_REGISTER_ = 9;
var GSPRegisterMessage = (function (_super) {
    __extends(GSPRegisterMessage, _super);
    function GSPRegisterMessage(senderRef, holderId, replicaId, holderAddress, holderPort, roundNr) {
        var _this = _super.call(this, exports._GSP_REGISTER_, senderRef) || this;
        _this.holderId = holderId;
        _this.replicaId = replicaId;
        _this.holderAddress = holderAddress;
        _this.holderPort = holderPort;
        _this.roundNr = roundNr;
        return _this;
    }
    return GSPRegisterMessage;
}(Message));
exports.GSPRegisterMessage = GSPRegisterMessage;
exports._GSP_ROUND_ = 10;
var GSPRoundMessage = (function (_super) {
    __extends(GSPRoundMessage, _super);
    function GSPRoundMessage(senderRef, round) {
        var _this = _super.call(this, exports._GSP_ROUND_, senderRef) || this;
        _this.round = round;
        _this.senderId = senderRef.ownerId;
        return _this;
    }
    return GSPRoundMessage;
}(Message));
exports.GSPRoundMessage = GSPRoundMessage;
exports._GSP_SYNC_ = 11;
var GSPSyncMessage = (function (_super) {
    __extends(GSPSyncMessage, _super);
    function GSPSyncMessage(senderRef, requesterId, repliqId) {
        var _this = _super.call(this, exports._GSP_SYNC_, senderRef) || this;
        _this.requesterId = requesterId;
        _this.repliqId = repliqId;
        return _this;
    }
    return GSPSyncMessage;
}(Message));
exports.GSPSyncMessage = GSPSyncMessage;
exports._REGISTER_EXTERNAL_SIGNAL_ = 12;
var RegisterExternalSignalMessage = (function (_super) {
    __extends(RegisterExternalSignalMessage, _super);
    function RegisterExternalSignalMessage(senderRef, requesterId, signalId, requesterAddress, requesterPort) {
        var _this = _super.call(this, exports._REGISTER_EXTERNAL_SIGNAL_, senderRef) || this;
        _this.requesterId = requesterId;
        _this.signalId = signalId;
        _this.requesterAddress = requesterAddress;
        _this.requesterPort = requesterPort;
        return _this;
    }
    return RegisterExternalSignalMessage;
}(Message));
exports.RegisterExternalSignalMessage = RegisterExternalSignalMessage;
exports._EXTERNAL_SIGNAL_CHANGE_ = 13;
var ExternalSignalChangeMessage = (function (_super) {
    __extends(ExternalSignalChangeMessage, _super);
    function ExternalSignalChangeMessage(senderRef, signalId, newVal) {
        var _this = _super.call(this, exports._EXTERNAL_SIGNAL_CHANGE_, senderRef) || this;
        _this.signalId = signalId;
        _this.newVal = newVal;
        return _this;
    }
    return ExternalSignalChangeMessage;
}(Message));
exports.ExternalSignalChangeMessage = ExternalSignalChangeMessage;
exports._EXTERNAL_SIGNAL_DELETE_ = 14;
var ExternalSignalDeleteMessage = (function (_super) {
    __extends(ExternalSignalDeleteMessage, _super);
    function ExternalSignalDeleteMessage(senderRef, signalId) {
        var _this = _super.call(this, exports._EXTERNAL_SIGNAL_DELETE_, senderRef) || this;
        _this.signalId = signalId;
        return _this;
    }
    return ExternalSignalDeleteMessage;
}(Message));
exports.ExternalSignalDeleteMessage = ExternalSignalDeleteMessage;

},{"./farRef":71}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 08/01/2017.
 */
var ObjectPool = (function () {
    function ObjectPool(behaviourObject) {
        if (behaviourObject === void 0) { behaviourObject = null; }
        this.currentId = 1;
        this.pool = new Map();
        this.pool.set(ObjectPool._BEH_OBJ_ID, behaviourObject);
    }
    ObjectPool.prototype.installBehaviourObject = function (behaviourObject) {
        this.pool.set(ObjectPool._BEH_OBJ_ID, behaviourObject);
    };
    ObjectPool.prototype.allocateObject = function (obj) {
        var objectId = this.currentId;
        this.pool.set(objectId, obj);
        this.currentId += 1;
        return objectId;
    };
    ObjectPool.prototype.getObject = function (objectId) {
        return this.pool.get(objectId);
    };
    ObjectPool._BEH_OBJ_ID = 0;
    return ObjectPool;
}());
exports.ObjectPool = ObjectPool;

},{}],75:[function(require,module,exports){
"use strict";
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../src/Message");
var farRef_1 = require("../src/FarRef");
var spiders_1 = require("./spiders");
var Repliq_1 = require("./Replication/Repliq");
var RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
var RepliqObjectField_1 = require("./Replication/RepliqObjectField");
var signal_1 = require("./Reactivivity/signal");
var Signal = require("./Reactivivity/signal").Signal;
/**
 * Created by flo on 19/12/2016.
 */
//Enables to detect true type of instances (e.g. array)
function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
function getObjectVars(object, receiverId, environment, ignoreSet) {
    if (ignoreSet === void 0) { ignoreSet = []; }
    var vars = [];
    var properties = Reflect.ownKeys(object);
    for (var i in properties) {
        var key = properties[i];
        if (!ignoreSet.includes(key)) {
            var val = Reflect.get(object, key);
            var serialisedval = serialise(val, receiverId, environment);
            vars.push([key, serialisedval]);
        }
    }
    return vars;
}
exports.getObjectVars = getObjectVars;
function getObjectMethods(object) {
    var methods = [];
    var proto = Object.getPrototypeOf(object);
    var properties = Reflect.ownKeys(proto);
    for (var i in properties) {
        var key = properties[i];
        var method = Reflect.get(proto, key);
        //Avoid copying over any construction functions (i.e. class declarations)
        if (typeof method == 'function' && !(method.toString()).startsWith("class")) {
            methods.push([key, method.toString()]);
        }
    }
    return methods;
}
exports.getObjectMethods = getObjectMethods;
function deconstructStatic(actorClass, receiverId, results, environment) {
    //Reached the end of the class chain (i.e. current class is function(){})
    if (actorClass.name == "") {
        return results;
    }
    else {
        var thisName = actorClass.name;
        var thisVars = [];
        var thisMethods = [];
        var keys = Reflect.ownKeys(actorClass);
        keys.forEach(function (key) {
            //Avoid sending the prototype and other function specific properties (given that classes are just functions)
            if (!(key == "prototype" || key == "name" || key == "length")) {
                var property = Reflect.get(actorClass, key);
                if (property instanceof Function) {
                    thisMethods.push([key, property.toString()]);
                }
                else {
                    thisVars.push([key, serialise(property, receiverId, environment)]);
                }
            }
        });
        results.push([thisName, thisVars, thisMethods]);
        return deconstructStatic(actorClass.__proto__, receiverId, results, environment);
    }
}
exports.deconstructStatic = deconstructStatic;
function constructMethod(functionSource) {
    if (functionSource.startsWith("function")) {
        var method = eval("(" + functionSource + ")");
    }
    else {
        var method = eval("(function " + functionSource + ")");
    }
    return method;
}
function reconstructStatic(behaviourObject, staticProperties, environment) {
    staticProperties.forEach(function (propertyArray) {
        var className = propertyArray[0];
        var stub = {};
        var vars = propertyArray[1];
        var methods = propertyArray[2];
        vars.forEach(function (varPair) {
            var key = varPair[0];
            var val = deserialise(varPair[1], environment);
            stub[key] = val;
        });
        methods.forEach(function (methodPair) {
            var key = methodPair[0];
            var functionSource = methodPair[1];
            stub[key] = constructMethod(functionSource);
        });
        var stubProxy = new Proxy(stub, {
            set: function (obj, prop, value) {
                throw new Error("Cannot mutate static property in actors");
            }
        });
        behaviourObject[className] = stubProxy;
    });
}
exports.reconstructStatic = reconstructStatic;
function deconstructBehaviour(object, currentLevel, accumVars, accumMethods, receiverId, environment) {
    var properties = Reflect.ownKeys(object);
    var localAccumVars = [];
    for (var i in properties) {
        var key = properties[i];
        var val = Reflect.get(object, key);
        if (typeof val != 'function' || isIsolateClass(val) || isRepliqClass(val) || isSignalClass(val)) {
            var serialisedval = serialise(val, receiverId, environment);
            localAccumVars.push([key, serialisedval]);
        }
    }
    localAccumVars.unshift(currentLevel);
    accumVars.push(localAccumVars);
    var localAccumMethods = [];
    var proto = object.__proto__;
    properties = Reflect.ownKeys(proto);
    properties.shift();
    var lastProto = properties.indexOf("spawn") != -1;
    if (!lastProto) {
        for (var i in properties) {
            var key = properties[i];
            var method = Reflect.get(proto, key);
            if (typeof method == 'function') {
                localAccumMethods.push([key, method.toString()]);
            }
        }
        localAccumMethods.unshift(currentLevel + 1);
        accumMethods.push(localAccumMethods);
        return deconstructBehaviour(proto, currentLevel + 1, accumVars, accumMethods, receiverId, environment);
    }
    else {
        return [accumVars, accumMethods];
    }
}
exports.deconstructBehaviour = deconstructBehaviour;
function reconstructBehaviour(baseObject, variables, methods, environment) {
    var amountOfProtos = methods.length;
    for (var i = 0; i < amountOfProtos; i++) {
        var copy = baseObject.__proto__;
        var newProto = {};
        newProto.__proto__ = copy;
        baseObject.__proto__ = newProto;
    }
    variables.forEach(function (levelVariables) {
        var installIn = getProtoForLevel(levelVariables[0], baseObject);
        levelVariables.shift();
        levelVariables.forEach(function (varEntry) {
            var key = varEntry[0];
            var rawVal = varEntry[1];
            var val = deserialise(rawVal, environment);
            installIn[key] = val;
        });
    });
    methods.forEach(function (levelMethods) {
        var installIn = getProtoForLevel(levelMethods[0], baseObject);
        levelMethods.shift();
        levelMethods.forEach(function (methodEntry) {
            var key = methodEntry[0];
            var functionSource = methodEntry[1];
            installIn[key] = constructMethod(functionSource);
        });
    });
    return baseObject;
}
exports.reconstructBehaviour = reconstructBehaviour;
function getProtoForLevel(level, object) {
    var ret = object;
    for (var i = 0; i < level; i++) {
        ret = ret.__proto__;
    }
    return ret;
}
function reconstructObject(baseObject, variables, methods, environment) {
    variables.forEach(function (varEntry) {
        var key = varEntry[0];
        var rawVal = varEntry[1];
        var val = deserialise(rawVal, environment);
        baseObject[key] = val;
    });
    methods.forEach(function (methodEntry) {
        var key = methodEntry[0];
        var functionSource = methodEntry[1];
        (baseObject.__proto__)[key] = constructMethod(functionSource);
    });
    return baseObject;
}
exports.reconstructObject = reconstructObject;
var ValueContainer = (function () {
    function ValueContainer(type) {
        this.type = type;
    }
    ValueContainer.nativeType = 0;
    ValueContainer.promiseType = 1;
    ValueContainer.serverFarRefType = 2;
    ValueContainer.errorType = 3;
    ValueContainer.arrayType = 4;
    ValueContainer.isolateType = 5;
    ValueContainer.isolateDefType = 6;
    ValueContainer.clientFarRefType = 7;
    ValueContainer.arrayIsolateType = 8;
    ValueContainer.repliqType = 9;
    ValueContainer.repliqFieldType = 10;
    ValueContainer.repliqDefinition = 11;
    ValueContainer.signalType = 12;
    ValueContainer.signalDefinition = 13;
    return ValueContainer;
}());
exports.ValueContainer = ValueContainer;
var NativeContainer = (function (_super) {
    __extends(NativeContainer, _super);
    function NativeContainer(value) {
        var _this = _super.call(this, ValueContainer.nativeType) || this;
        _this.value = value;
        return _this;
    }
    return NativeContainer;
}(ValueContainer));
exports.NativeContainer = NativeContainer;
var PromiseContainer = (function (_super) {
    __extends(PromiseContainer, _super);
    function PromiseContainer(promiseId, promiseCreatorId) {
        var _this = _super.call(this, ValueContainer.promiseType) || this;
        _this.promiseId = promiseId;
        _this.promiseCreatorId = promiseCreatorId;
        return _this;
    }
    return PromiseContainer;
}(ValueContainer));
exports.PromiseContainer = PromiseContainer;
var ServerFarRefContainer = (function (_super) {
    __extends(ServerFarRefContainer, _super);
    function ServerFarRefContainer(objectId, ownerId, ownerAddress, ownerPort) {
        var _this = _super.call(this, ValueContainer.serverFarRefType) || this;
        _this.objectId = objectId;
        _this.ownerId = ownerId;
        _this.ownerAddress = ownerAddress;
        _this.ownerPort = ownerPort;
        return _this;
    }
    return ServerFarRefContainer;
}(ValueContainer));
exports.ServerFarRefContainer = ServerFarRefContainer;
var ClientFarRefContainer = (function (_super) {
    __extends(ClientFarRefContainer, _super);
    function ClientFarRefContainer(objectId, ownerId, mainId, contactId, contactAddress, contactPort) {
        var _this = _super.call(this, ValueContainer.clientFarRefType) || this;
        _this.objectId = objectId;
        _this.ownerId = ownerId;
        _this.mainId = mainId;
        _this.contactId = contactId;
        _this.contactAddress = contactAddress;
        _this.contactPort = contactPort;
        return _this;
    }
    return ClientFarRefContainer;
}(ValueContainer));
exports.ClientFarRefContainer = ClientFarRefContainer;
var ErrorContainer = (function (_super) {
    __extends(ErrorContainer, _super);
    function ErrorContainer(error) {
        var _this = _super.call(this, ValueContainer.errorType) || this;
        _this.message = error.message;
        _this.stack = error.stack;
        _this.name = error.name;
        return _this;
    }
    return ErrorContainer;
}(ValueContainer));
exports.ErrorContainer = ErrorContainer;
var ArrayContainer = (function (_super) {
    __extends(ArrayContainer, _super);
    function ArrayContainer(values) {
        var _this = _super.call(this, ValueContainer.arrayType) || this;
        _this.values = values;
        return _this;
    }
    return ArrayContainer;
}(ValueContainer));
exports.ArrayContainer = ArrayContainer;
var IsolateContainer = (function (_super) {
    __extends(IsolateContainer, _super);
    function IsolateContainer(vars, methods) {
        var _this = _super.call(this, ValueContainer.isolateType) || this;
        _this.vars = vars;
        _this.methods = methods;
        return _this;
    }
    IsolateContainer.checkIsolateFuncKey = "_INSTANCEOF_ISOLATE_";
    return IsolateContainer;
}(ValueContainer));
exports.IsolateContainer = IsolateContainer;
var IsolateDefinitionContainer = (function (_super) {
    __extends(IsolateDefinitionContainer, _super);
    function IsolateDefinitionContainer(definition) {
        var _this = _super.call(this, ValueContainer.isolateDefType) || this;
        _this.definition = definition;
        return _this;
    }
    return IsolateDefinitionContainer;
}(ValueContainer));
exports.IsolateDefinitionContainer = IsolateDefinitionContainer;
var ArrayIsolateContainer = (function (_super) {
    __extends(ArrayIsolateContainer, _super);
    function ArrayIsolateContainer(array) {
        var _this = _super.call(this, ValueContainer.arrayIsolateType) || this;
        _this.array = array;
        return _this;
    }
    ArrayIsolateContainer.checkArrayIsolateFuncKey = "_INSTANCEOF_ARRAY_ISOLATE_";
    return ArrayIsolateContainer;
}(ValueContainer));
exports.ArrayIsolateContainer = ArrayIsolateContainer;
var RepliqContainer = (function (_super) {
    __extends(RepliqContainer, _super);
    function RepliqContainer(primitiveFields, objectFields, innerRepFields, methods, atomicMethods, repliqId, masterOwnerId, isClient, ownerAddress, ownerPort, lastConfirmedRound, innerName) {
        if (innerName === void 0) { innerName = ""; }
        var _this = _super.call(this, ValueContainer.repliqType) || this;
        _this.primitiveFields = primitiveFields;
        _this.objectFields = objectFields;
        _this.innerRepFields = innerRepFields;
        _this.innerName = innerName;
        _this.methods = methods;
        _this.atomicMethods = atomicMethods;
        _this.repliqId = repliqId;
        _this.masterOwnerId = masterOwnerId;
        _this.isClient = isClient;
        _this.ownerAddress = ownerAddress;
        _this.ownerPort = ownerPort;
        _this.lastConfirmedRound = lastConfirmedRound;
        return _this;
    }
    RepliqContainer.checkRepliqFuncKey = "_INSTANCEOF_REPLIQ_";
    return RepliqContainer;
}(ValueContainer));
exports.RepliqContainer = RepliqContainer;
var RepliqFieldContainer = (function (_super) {
    __extends(RepliqFieldContainer, _super);
    function RepliqFieldContainer(name, tentative, commited, readFunc, writeFunc, resetFunc, commitFunc, updateFunc) {
        var _this = _super.call(this, ValueContainer.repliqFieldType) || this;
        _this.name = name;
        _this.tentative = tentative;
        _this.commited = commited;
        _this.readFunc = readFunc;
        _this.writeFunc = writeFunc;
        _this.resetFunc = resetFunc;
        _this.commitFunc = commitFunc;
        _this.updateFunc = updateFunc;
        return _this;
    }
    return RepliqFieldContainer;
}(ValueContainer));
var RepliqDefinitionContainer = (function (_super) {
    __extends(RepliqDefinitionContainer, _super);
    function RepliqDefinitionContainer(definition) {
        var _this = _super.call(this, ValueContainer.repliqDefinition) || this;
        _this.definition = definition;
        return _this;
    }
    return RepliqDefinitionContainer;
}(ValueContainer));
exports.RepliqDefinitionContainer = RepliqDefinitionContainer;
//When a signal is serialised and passed to another actor it can implicitly only depend on the original signal
//From the moment the signal is deserialised on the receiving side it will act as a source for that actor
//Hence, all the information needed is the signal's id and its current value
var SignalContainer = (function (_super) {
    __extends(SignalContainer, _super);
    function SignalContainer(id, objectValue, currentValue, rateLowerBound, rateUpperBound, clock, strong, ownerId, ownerAddress, ownerPort) {
        var _this = _super.call(this, ValueContainer.signalType) || this;
        _this.id = id;
        _this.obectValue = objectValue;
        _this.currentValue = currentValue;
        _this.rateLowerBound = rateLowerBound;
        _this.rateUpperBound = rateUpperBound;
        _this.clock = clock;
        _this.strong = strong;
        _this.ownerId = ownerId;
        _this.ownerAddress = ownerAddress;
        _this.ownerPort = ownerPort;
        return _this;
    }
    SignalContainer.checkSignalFuncKey = "_INSTANCEOF_Signal_";
    return SignalContainer;
}(ValueContainer));
exports.SignalContainer = SignalContainer;
var SignalDefinitionContainer = (function (_super) {
    __extends(SignalDefinitionContainer, _super);
    function SignalDefinitionContainer(definition, mutators) {
        var _this = _super.call(this, ValueContainer.signalDefinition) || this;
        _this.definition = definition;
        _this.mutators = mutators;
        return _this;
    }
    return SignalDefinitionContainer;
}(ValueContainer));
exports.SignalDefinitionContainer = SignalDefinitionContainer;
function isClass(func) {
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}
function isIsolateClass(func) {
    return (func.toString().search(/extends.*?Isolate/) != -1);
}
function isRepliqClass(func) {
    return (func.toString().search(/extends.*?Repliq/) != -1);
}
function isSignalClass(func) {
    return (func.toString().search(/extends.*?Signal/) != -1);
}
function serialisePromise(promise, receiverId, enviroment) {
    var wrapper = enviroment.promisePool.newPromise();
    promise.then(function (val) {
        enviroment.commMedium.sendMessage(receiverId, new messages_1.ResolvePromiseMessage(enviroment.thisRef, wrapper.promiseId, serialise(val, receiverId, enviroment), true));
    });
    promise.catch(function (reason) {
        enviroment.commMedium.sendMessage(receiverId, new messages_1.RejectPromiseMessage(enviroment.thisRef, wrapper.promiseId, serialise(reason, receiverId, enviroment), true));
    });
    return new PromiseContainer(wrapper.promiseId, enviroment.thisRef.ownerId);
}
function serialiseObject(object, thisRef, objectPool) {
    var oId = objectPool.allocateObject(object);
    if (thisRef instanceof farRef_1.ServerFarReference) {
        return new ServerFarRefContainer(oId, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
    }
    else {
        var clientRef = thisRef;
        return new ClientFarRefContainer(oId, clientRef.ownerId, clientRef.mainId, clientRef.contactId, clientRef.contactAddress, clientRef.contactPort);
    }
}
function serialiseRepliqFields(fields, receiverId, environment) {
    var primitives = [];
    var objects = [];
    var innerReps = [];
    var ret = [primitives, objects, innerReps];
    fields.forEach(function (repliqField, fieldName) {
        if (repliqField instanceof RepliqPrimitiveField_1.RepliqPrimitiveField) {
            primitives.push(new RepliqFieldContainer(fieldName, repliqField.tentative, repliqField.commited, repliqField.read.toString(), repliqField.writeField.toString(), repliqField.resetToCommit.toString(), repliqField.commit.toString(), repliqField.update.toString()));
        }
        else if (repliqField instanceof RepliqObjectField_1.RepliqObjectField) {
            var field = repliqField;
            var tentMethods = void 0;
            var commMethods = void 0;
            //Avoid copying over Object prototype methods containing native javascript code (cannot be evalled by deserialiser)
            if (Object.getPrototypeOf(field.tentative) == Object.getPrototypeOf({})) {
                tentMethods = [];
                commMethods = [];
            }
            else {
                tentMethods = getObjectMethods(field.tentative);
                commMethods = getObjectMethods(field.commited);
            }
            var tentative = JSON.stringify([JSON.stringify(getObjectVars(field.tentative, receiverId, environment)), JSON.stringify(tentMethods)]);
            var commited = JSON.stringify([JSON.stringify(getObjectVars(field.commited, receiverId, environment)), JSON.stringify(commMethods)]);
            objects.push(new RepliqFieldContainer(fieldName, tentative, commited, field.read.toString(), field.writeField.toString(), field.resetToCommit.toString(), field.commit.toString(), field.update.toString()));
        }
        else if (repliqField[RepliqContainer.checkRepliqFuncKey]) {
            innerReps.push(serialiseRepliq(repliqField, receiverId, environment, fieldName));
        }
        else {
            throw new Error("Unknown Repliq field type in serialisation");
        }
    });
    return ret;
}
function serialiseRepliq(repliqProxy, receiverId, environment, innerName) {
    if (innerName === void 0) { innerName = ""; }
    var fields = repliqProxy[Repliq_1.Repliq.getRepliqFields];
    var fieldsArr = serialiseRepliqFields(fields, receiverId, environment);
    var primitiveFields = fieldsArr[0];
    var objectFields = fieldsArr[1];
    var innerReps = fieldsArr[2];
    var methods = repliqProxy[Repliq_1.Repliq.getRepliqOriginalMethods];
    var methodArr = [];
    var atomicArr = [];
    methods.forEach(function (method, methodName) {
        if (method[Repliq_1.Repliq.isAtomic]) {
            atomicArr.push([methodName, method.toString()]);
        }
        else {
            methodArr.push([methodName, method.toString()]);
        }
    });
    var repliqId = repliqProxy[Repliq_1.Repliq.getRepliqID];
    var repliqOwnerId = repliqProxy[Repliq_1.Repliq.getRepliqOwnerID];
    var isClient = repliqProxy[Repliq_1.Repliq.isClientMaster];
    var ownerAddress = repliqProxy[Repliq_1.Repliq.getRepliqOwnerAddress];
    var ownerPort = repliqProxy[Repliq_1.Repliq.getRepliqOwnerPort];
    var roundNr;
    //Possible that repliq has not yet been modified at serialisation time
    if (environment.gspInstance.roundNumbers.has(repliqId)) {
        roundNr = environment.gspInstance.roundNumbers.get(repliqId);
    }
    else {
        roundNr = 0;
    }
    var ret = new RepliqContainer(JSON.stringify(primitiveFields), JSON.stringify(objectFields), JSON.stringify(innerReps), JSON.stringify(methodArr), JSON.stringify(atomicArr), repliqId, repliqOwnerId, isClient, ownerAddress, ownerPort, roundNr, innerName);
    if (environment.thisRef instanceof farRef_1.ServerFarReference) {
        if (ret.isClient) {
            environment.gspInstance.addForward(ret.repliqId, ret.masterOwnerId);
            ret.masterOwnerId = environment.thisRef.ownerId;
            ret.ownerAddress = environment.thisRef.ownerAddress;
            ret.ownerPort = environment.thisRef.ownerPort;
            ret.isClient = false;
        }
        else if (ret.ownerAddress == null) {
            ret.ownerAddress = environment.thisRef.ownerAddress;
            ret.ownerPort = environment.thisRef.ownerPort;
            ret.isClient = false;
        }
    }
    else {
        ret.isClient = true;
    }
    return ret;
}
function serialise(value, receiverId, environment) {
    if (typeof value == 'object') {
        if (value == null) {
            return new NativeContainer(null);
        }
        else if (value instanceof Promise) {
            return serialisePromise(value, receiverId, environment);
        }
        else if (value instanceof Error) {
            return new ErrorContainer(value);
        }
        else if (value[farRef_1.FarReference.ServerProxyTypeKey]) {
            var farRef = value[farRef_1.FarReference.farRefAccessorKey];
            return new ServerFarRefContainer(farRef.objectId, farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
        }
        else if (value[farRef_1.FarReference.ClientProxyTypeKey]) {
            var farRef_2 = value[farRef_1.FarReference.farRefAccessorKey];
            if (environment.thisRef instanceof farRef_1.ServerFarReference && farRef_2.contactId == null) {
                //Current actor is a server and is the first to obtain a reference to this client actor. conversation with this client should now be rooted through this actor given that it has a socket reference to it
                return new ClientFarRefContainer(farRef_2.objectId, farRef_2.ownerId, farRef_2.mainId, environment.thisRef.ownerId, environment.thisRef.ownerAddress, environment.thisRef.ownerPort);
            }
            else {
                return new ClientFarRefContainer(farRef_2.objectId, farRef_2.ownerId, farRef_2.mainId, farRef_2.contactId, farRef_2.contactAddress, farRef_2.contactPort);
            }
        }
        else if (value[ArrayIsolateContainer.checkArrayIsolateFuncKey]) {
            return new ArrayIsolateContainer(value.array);
        }
        else if (value instanceof Array) {
            var values = value.map(function (val) {
                return serialise(val, receiverId, environment);
            });
            return new ArrayContainer(values);
        }
        else if (value[IsolateContainer.checkIsolateFuncKey]) {
            var vars = getObjectVars(value, receiverId, environment);
            var methods = getObjectMethods(value);
            return new IsolateContainer(JSON.stringify(vars), JSON.stringify(methods));
        }
        else if (value[RepliqContainer.checkRepliqFuncKey]) {
            return serialiseRepliq(value, receiverId, environment);
        }
        else if (value[SignalContainer.checkSignalFuncKey]) {
            var sig_1 = (value.holder);
            if (!sig_1.isGarbage) {
                var isValueObject = sig_1.value instanceof signal_1.SignalObject;
                var val = void 0;
                if (isValueObject) {
                    var vars_1 = getObjectVars(sig_1.value, receiverId, environment, ["holder"]);
                    var methods_1 = getObjectMethods(sig_1.value);
                    //No need to keep track of which methods are mutators during serialisation. Only owner can mutate and change/propagate!
                    methods_1.forEach(function (methodArr, index) {
                        var name = methodArr[0];
                        if (sig_1.value[name][signal_1.SignalValue.IS_MUTATOR]) {
                            var sigProto = Object.getPrototypeOf(sig_1.value);
                            var method = Reflect.get(sigProto, name);
                            //console.log("Original method: " + method[SignalValue.GET_ORIGINAL].toString())
                            methods_1[index] = [name, method[signal_1.SignalValue.GET_ORIGINAL].toString()];
                        }
                    });
                    val = [JSON.stringify(vars_1), JSON.stringify(methods_1)];
                }
                else {
                    //Only way that value isn't an object is if it is the result of a lifted function
                    val = sig_1.value.lastVal;
                }
                return new SignalContainer(sig_1.id, isValueObject, val, sig_1.rateLowerBound, sig_1.rateUpperBound, sig_1.clock, sig_1.tempStrong, environment.thisRef.ownerId, environment.thisRef.ownerAddress, environment.thisRef.ownerPort);
            }
            else {
                throw new Error("Serialisation of signals part of garbage dependency graph dissalowed ");
            }
        }
        else {
            return serialiseObject(value, environment.thisRef, environment.objectPool);
        }
    }
    else if (typeof value == 'function') {
        //Value is actualy not a function but the result of a field access on a proxy (which is technically a function, see farRef)
        if (value[farRef_1.FarReference.proxyWrapperAccessorKey]) {
            return serialisePromise(value, receiverId, environment);
        }
        else if (isClass(value) && isIsolateClass(value)) {
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            return new IsolateDefinitionContainer(definition.replace("super()", ''));
        }
        else if (isClass(value) && isRepliqClass(value)) {
            //TODO might need to extract annotations in same way that is done for signals
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            return new RepliqDefinitionContainer(definition);
        }
        else if (isClass(value) && isSignalClass(value)) {
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            var mutators_1 = [];
            //Need to find out which of the definition's methods are mutating. Can only do this on an instantiated object
            var dummy_1 = new value();
            var methodKeys = Reflect.ownKeys(Object.getPrototypeOf(dummy_1));
            methodKeys.forEach(function (methodName) {
                var property = Reflect.get(Object.getPrototypeOf(dummy_1), methodName);
                if (property[signal_1.SignalValue.IS_MUTATOR]) {
                    mutators_1.push(methodName);
                }
            });
            return new SignalDefinitionContainer(definition, mutators_1);
        }
        else if (isClass(value)) {
            throw new Error("Serialisation of classes disallowed");
        }
        else {
            throw new Error("Serialisation of functions disallowed: " + value.toString());
        }
    }
    else {
        return new NativeContainer(value);
    }
}
exports.serialise = serialise;
function deserialise(value, enviroment) {
    function deSerialisePromise(promiseContainer) {
        return enviroment.promisePool.newForeignPromise(promiseContainer.promiseId, promiseContainer.promiseCreatorId);
    }
    function deSerialiseServerFarRef(farRefContainer) {
        var farRef = new farRef_1.ServerFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.ownerAddress, farRefContainer.ownerPort, enviroment);
        if (enviroment.thisRef instanceof farRef_1.ServerFarReference) {
            if (!(enviroment.commMedium.hasConnection(farRef.ownerId))) {
                enviroment.commMedium.openConnection(farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
            }
        }
        else {
            if (!(enviroment.commMedium.hasConnection(farRef.ownerId))) {
                enviroment.commMedium.connectTransientRemote(enviroment.thisRef, farRef, enviroment.promisePool);
            }
        }
        return farRef.proxyify();
    }
    function deSerialiseClientFarRef(farRefContainer) {
        var farRef;
        if ((enviroment.thisRef instanceof farRef_1.ServerFarReference) && farRefContainer.contactId == null) {
            //This is the first server side actor to come into contact with this client-side far reference and will henceforth be the contact point for all messages sent to this far reference
            farRef = new farRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.mainId, enviroment, enviroment.thisRef.ownerId, enviroment.thisRef.ownerAddress, enviroment.thisRef.ownerPort);
        }
        else {
            farRef = new farRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.mainId, enviroment, farRefContainer.contactId, farRefContainer.contactAddress, farRefContainer.contactPort);
        }
        return farRef.proxyify();
    }
    function deSerialiseError(errorContainer) {
        var error = new Error(errorContainer.message);
        error.stack = errorContainer.stack;
        error.name = errorContainer.name;
        return error;
    }
    function deSerialiseArray(arrayContainer) {
        var deserialised = arrayContainer.values.map(function (valCont) {
            return deserialise(valCont, enviroment);
        });
        return deserialised;
    }
    function deSerialiseIsolate(isolateContainer) {
        var isolate = reconstructObject(new spiders_1.Isolate(), JSON.parse(isolateContainer.vars), JSON.parse(isolateContainer.methods), enviroment);
        return isolate;
    }
    function deSerialiseIsolateDefinition(isolateDefContainer) {
        var classObj = eval(isolateDefContainer.definition);
        classObj.prototype[IsolateContainer.checkIsolateFuncKey] = true;
        return classObj;
    }
    function deSerialiseArrayIsolate(arrayIsolateContainer) {
        return new spiders_1.ArrayIsolate(arrayIsolateContainer.array);
    }
    function deSerialiseRepliq(repliqContainer) {
        var blankRepliq = new Repliq_1.Repliq();
        var fields = new Map();
        (JSON.parse(repliqContainer.primitiveFields)).forEach(function (repliqField) {
            var field = new RepliqPrimitiveField_1.RepliqPrimitiveField(repliqField.name, repliqField.tentative);
            field.commited = repliqField.commited;
            field.read = constructMethod(repliqField.readFunc);
            field.writeField = constructMethod(repliqField.writeFunc);
            field.resetToCommit = constructMethod(repliqField.resetFunc);
            field.commit = constructMethod(repliqField.commitFunc);
            field.update = constructMethod(repliqField.updateFunc);
            fields.set(field.name, field);
        });
        (JSON.parse(repliqContainer.objectFields)).forEach(function (repliqField) {
            var tentParsed = JSON.parse(repliqField.tentative);
            var comParsed = JSON.parse(repliqField.commited);
            var tentBase = {};
            Reflect.setPrototypeOf(tentBase, {});
            var comBase = {};
            Reflect.setPrototypeOf(comBase, {});
            var tentative = reconstructObject(tentBase, JSON.parse(tentParsed[0]), JSON.parse(tentParsed[1]), enviroment);
            var commited = reconstructObject(comBase, JSON.parse(comParsed[0]), JSON.parse(comParsed[1]), enviroment);
            var field = new RepliqObjectField_1.RepliqObjectField(repliqField.name, {});
            field.tentative = tentative;
            field.commited = commited;
            field.read = constructMethod(repliqField.readFunc);
            field.writeField = constructMethod(repliqField.writeFunc);
            field.resetToCommit = constructMethod(repliqField.resetFunc);
            field.commit = constructMethod(repliqField.commitFunc);
            field.update = constructMethod(repliqField.updateFunc);
            fields.set(field.name, field);
        });
        (JSON.parse(repliqContainer.innerRepFields)).forEach(function (innerRepliq) {
            fields.set(innerRepliq.innerName, deserialise(innerRepliq, enviroment));
        });
        var methods = new Map();
        (JSON.parse(repliqContainer.methods)).forEach(function (_a) {
            var methodName = _a[0], methodSource = _a[1];
            methods.set(methodName, constructMethod(methodSource));
        });
        var atomicMethods = new Map();
        (JSON.parse(repliqContainer.atomicMethods)).forEach(function (_a) {
            var methodName = _a[0], methodSource = _a[1];
            atomicMethods.set(methodName, constructMethod(methodSource));
        });
        if (!repliqContainer.isClient && !enviroment.commMedium.hasConnection(repliqContainer.masterOwnerId)) {
            enviroment.commMedium.openConnection(repliqContainer.masterOwnerId, repliqContainer.ownerAddress, repliqContainer.ownerPort);
        }
        return blankRepliq.reconstruct(enviroment.gspInstance, repliqContainer.repliqId, repliqContainer.masterOwnerId, fields, methods, atomicMethods, repliqContainer.isClient, repliqContainer.ownerAddress, repliqContainer.ownerPort, repliqContainer.lastConfirmedRound);
    }
    function deSerialiseRepliqDefinition(def) {
        var index = def.definition.indexOf("{");
        var start = def.definition.substring(0, index);
        var stop = def.definition.substring(index, def.definition.length);
        var Repliq = require("./Replication/Repliq").Repliq;
        var classObj = eval(start + " extends Repliq" + stop);
        return classObj;
    }
    function deSerialiseSignal(sigContainer) {
        if (!enviroment.commMedium.hasConnection(sigContainer.ownerId)) {
            enviroment.commMedium.openConnection(sigContainer.ownerId, sigContainer.ownerAddress, sigContainer.ownerPort);
        }
        var signalId = sigContainer.id;
        var currentVal;
        if (sigContainer.obectValue) {
            var infoArr = sigContainer.currentValue;
            currentVal = reconstructObject(new signal_1.SignalObject(), JSON.parse(infoArr[0]), JSON.parse(infoArr[1]), enviroment);
        }
        else {
            var dummyFunc = new signal_1.SignalFunction(function () { });
            dummyFunc.lastVal = sigContainer.currentValue;
            currentVal = dummyFunc;
        }
        var signalProxy = new Signal(currentVal);
        signalProxy.rateLowerBound = sigContainer.rateLowerBound;
        signalProxy.rateUpperBound = sigContainer.rateUpperBound;
        signalProxy.clock = sigContainer.clock;
        signalProxy.id = signalId;
        signalProxy.value.setHolder(signalProxy);
        signalProxy.strong = sigContainer.strong;
        signalProxy.tempStrong = sigContainer.strong;
        var known = enviroment.signalPool.knownSignal(signalId);
        if (!known) {
            enviroment.signalPool.newSource(signalProxy);
            enviroment.commMedium.sendMessage(sigContainer.ownerId, new messages_1.RegisterExternalSignalMessage(enviroment.thisRef, enviroment.thisRef.ownerId, signalId, enviroment.thisRef.ownerAddress, enviroment.thisRef.ownerPort));
        }
        return signalProxy.value;
    }
    function deSerialiseSignalDefinition(def) {
        var index = def.definition.indexOf("{");
        var start = def.definition.substring(0, index);
        var stop = def.definition.substring(index, def.definition.length);
        var Signal = require("./Reactivivity/signal").SignalObject;
        var classObj = eval(start + " extends Signal" + stop);
        var mutators = def.mutators;
        //Create a dummy signal instance to get the class name
        var dummy = new classObj();
        mutators.forEach(function (mutator) {
            enviroment.signalPool.addMutator(dummy.constructor.name, mutator);
        });
        return classObj;
    }
    switch (value.type) {
        case ValueContainer.nativeType:
            return value.value;
        case ValueContainer.promiseType:
            return deSerialisePromise(value);
        case ValueContainer.clientFarRefType:
            return deSerialiseClientFarRef(value);
        case ValueContainer.serverFarRefType:
            return deSerialiseServerFarRef(value);
        case ValueContainer.errorType:
            return deSerialiseError(value);
        case ValueContainer.arrayType:
            return deSerialiseArray(value);
        case ValueContainer.isolateType:
            return deSerialiseIsolate(value);
        case ValueContainer.isolateDefType:
            return deSerialiseIsolateDefinition(value);
        case ValueContainer.arrayIsolateType:
            return deSerialiseArrayIsolate(value);
        case ValueContainer.repliqType:
            return deSerialiseRepliq(value);
        case ValueContainer.repliqDefinition:
            return deSerialiseRepliqDefinition(value);
        case ValueContainer.signalType:
            return deSerialiseSignal(value);
        case ValueContainer.signalDefinition:
            return deSerialiseSignalDefinition(value);
        default:
            throw "Unknown value container type :  " + value.type;
    }
}
exports.deserialise = deserialise;

},{"./Reactivivity/signal":61,"./Replication/Repliq":64,"./Replication/RepliqObjectField":66,"./Replication/RepliqPrimitiveField":67,"./farRef":71,"./messages":73,"./spiders":77}],76:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var commMedium_1 = require("../src/CommMedium");
/**
 * Created by flo on 19/12/2016.
 */
var SocketHandler = (function () {
    function SocketHandler(owner) {
        this.owner = owner;
        this.disconnectedActors = [];
        this.pendingMessages = new Map();
        this.fuckUpMessage = new Map();
    }
    SocketHandler.prototype.addDisconnected = function (actorId) {
        this.disconnectedActors.push(actorId);
        this.pendingMessages.set(actorId, []);
    };
    SocketHandler.prototype.removeFromDisconnected = function (actorId, connection) {
        var _this = this;
        this.owner.connectedActors.set(actorId, connection);
        this.disconnectedActors = this.disconnectedActors.filter(function (id) {
            id != actorId;
        });
        if (this.pendingMessages.has(actorId)) {
            var messages = this.pendingMessages.get(actorId);
            messages.forEach(function (msg) {
                _this.sendMessage(actorId, msg);
            });
        }
    };
    //Open connection to Node.js instance owning the object to which the far reference refers to
    SocketHandler.prototype.openConnection = function (actorId, actorAddress, actorPort) {
        var that = this;
        var connection = require('socket.io-client')('http://' + actorAddress + ":" + actorPort);
        this.addDisconnected(actorId);
        connection.on('connect', function () {
            that.removeFromDisconnected(actorId, connection);
            //TODO To remove once solution found
            if (that.fuckUpMessage.has(actorId)) {
                that.fuckUpMessage.get(actorId).forEach(function (msg) {
                    that.sendMessage(actorId, msg);
                });
            }
        });
        connection.on('message', function (data) {
            that.messageHandler.dispatch(data);
        });
        connection.on('disconnect', function () {
            that.disconnectedActors.push(actorId);
        });
    };
    SocketHandler.prototype.sendMessage = function (actorId, msg) {
        if (this.disconnectedActors.indexOf(actorId) != -1) {
            var msgs = this.pendingMessages.get(actorId);
            msgs.push(msg);
            this.pendingMessages.set(actorId, msgs);
        }
        else if (this.owner.connectedActors.has(actorId)) {
            var sock = this.owner.connectedActors.get(actorId);
            sock.emit('message', msg);
        }
        else {
            //TODO TEMP
            if (this.fuckUpMessage.has(actorId)) {
                this.fuckUpMessage.get(actorId).push(msg);
            }
            else {
                var q = [msg];
                this.fuckUpMessage.set(actorId, q);
            }
            //throw new Error("Unable to send message to unknown actor (socket handler) in " + msg.fieldName + " to : " + actorId + " in : " + this.messageHandler.thisRef.ownerId)
        }
    };
    return SocketHandler;
}());
exports.SocketHandler = SocketHandler;
var ServerSocketManager = (function (_super) {
    __extends(ServerSocketManager, _super);
    function ServerSocketManager(ip, socketPort) {
        var _this = _super.call(this) || this;
        //Again very dirty hack to satisfy react-native
        var io = eval("req" + "uire('socket.io')");
        _this.socketIp = ip;
        _this.socketPort = socketPort;
        _this.socket = io(socketPort);
        _this.connectedClients = new Map();
        return _this;
    }
    ServerSocketManager.prototype.init = function (messageHandler) {
        _super.prototype.init.call(this, messageHandler);
        this.socketHandler.messageHandler = messageHandler;
        this.socket.on('connection', function (client) {
            client.on('message', function (data) {
                messageHandler.dispatch(data, [], client);
            });
            client.on('close', function () {
                //TODO
            });
        });
    };
    //Open connection to Node.js instance owning the object to which the far reference refers to
    ServerSocketManager.prototype.openConnection = function (actorId, actorAddress, actorPort) {
        this.socketHandler.openConnection(actorId, actorAddress, actorPort);
    };
    ServerSocketManager.prototype.addNewClient = function (actorId, socket) {
        this.connectedClients.set(actorId, socket);
    };
    ServerSocketManager.prototype.sendMessage = function (actorId, msg) {
        if (this.connectedClients.has(actorId)) {
            this.connectedClients.get(actorId).emit('message', JSON.stringify(msg));
        }
        else {
            this.socketHandler.sendMessage(actorId, msg);
        }
    };
    ServerSocketManager.prototype.hasConnection = function (actorId) {
        return (this.socketHandler.disconnectedActors.indexOf(actorId) != -1) || this.connectedActors.has(actorId);
    };
    ServerSocketManager.prototype.closeAll = function () {
        this.socket.close();
        this.connectedActors.forEach(function (sock) {
            sock.close();
        });
    };
    return ServerSocketManager;
}(commMedium_1.CommMedium));
exports.ServerSocketManager = ServerSocketManager;

},{"./commMedium":70,"socket.io-client":26}],77:[function(require,module,exports){
(function (__dirname){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sockets_1 = require("../src/Sockets");
var messageHandler_1 = require("./messageHandler");
var farRef_1 = require("../src/FarRef");
var PromisePool_1 = require("./PromisePool");
var objectPool_1 = require("../src/ObjectPool");
var serialisation_1 = require("./serialisation");
var ChannelManager_1 = require("./ChannelManager");
var messages_1 = require("../src/Message");
var GSP_1 = require("./Replication/GSP");
var Repliq_1 = require("./Replication/Repliq");
var RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
var RepliqField_1 = require("./Replication/RepliqField");
var RepliqObjectField_1 = require("./Replication/RepliqObjectField");
var signal_1 = require("./Reactivivity/signal");
var signalPool_1 = require("./Reactivivity/signalPool");
var ActorEnvironment_1 = require("./ActorEnvironment");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
var Isolate = (function () {
    function Isolate() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
    }
    return Isolate;
}());
exports.Isolate = Isolate;
var ArrayIsolate = (function () {
    function ArrayIsolate(array) {
        this[serialisation_1.ArrayIsolateContainer.checkArrayIsolateFuncKey] = true;
        this.array = array;
        for (var i = 0; i < array.length; i++) {
            this[i] = array[i];
        }
    }
    ArrayIsolate.prototype.forEach = function (callback) {
        return this.array.forEach(callback);
    };
    ArrayIsolate.prototype.filter = function (callback) {
        return this.array.filter(callback);
    };
    return ArrayIsolate;
}());
exports.ArrayIsolate = ArrayIsolate;
function updateExistingChannels(mainRef, existingActors, newActorId) {
    var mappings = [[], []];
    existingActors.forEach(function (actorPair) {
        var workerId = actorPair[0];
        var worker = actorPair[1];
        var channel = new MessageChannel();
        worker.postMessage(JSON.stringify(new messages_1.OpenPortMessage(mainRef, newActorId)), [channel.port1]);
        mappings[0].push(workerId);
        mappings[1].push(channel.port2);
    });
    return mappings;
}
var Actor = (function () {
    function Actor() {
    }
    return Actor;
}());
var ClientActor = (function (_super) {
    __extends(ClientActor, _super);
    function ClientActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClientActor.prototype.spawn = function (app, thisClass) {
        var actorId = utils.generateId();
        var channelMappings = updateExistingChannels(app.mainEnvironment.thisRef, app.spawnedActors, actorId);
        var work = require('webworkify');
        var webWorker = work(require('../src/ActorProto'));
        webWorker.addEventListener('message', function (event) {
            app.mainMessageHandler.dispatch(event);
        });
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], actorId, app.mainEnvironment);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, actorId, [], app.mainEnvironment);
        var mainChannel = new MessageChannel();
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        var newActorChannels = [mainChannel.port1].concat(channelMappings[1]);
        var installMessage = new messages_1.InstallBehaviourMessage(app.mainEnvironment.thisRef, app.mainId, actorId, actorVariables, actorMethods, staticProperties, channelMappings[0]);
        webWorker.postMessage(JSON.stringify(installMessage), newActorChannels);
        var channelManager = app.mainEnvironment.commMedium;
        channelManager.newConnection(actorId, mainChannel.port2);
        var ref = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainId, app.mainEnvironment);
        app.spawnedActors.push([actorId, webWorker]);
        return ref.proxyify();
    };
    return ClientActor;
}(Actor));
var ServerActor = (function (_super) {
    __extends(ServerActor, _super);
    function ServerActor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServerActor.prototype.spawn = function (app, port, thisClass) {
        var socketManager = app.mainEnvironment.commMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils.generateId();
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], actorId, app.mainEnvironment);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, actorId, [], app.mainEnvironment);
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor = fork(__dirname + '/actorProto.js', [false, app.mainIp, port, actorId, app.mainId, app.mainPort, JSON.stringify(actorVariables), JSON.stringify(actorMethods), JSON.stringify(staticProperties)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainEnvironment);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    };
    ServerActor.spawnFromFile = function (app, port, filePath, actorClassName, constructorArgs) {
        var socketManager = app.mainEnvironment.commMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils.generateId();
        var serialisedArgs = [];
        constructorArgs.forEach(function (constructorArg) {
            serialisedArgs.push(serialisation_1.serialise(constructorArg, actorId, app.mainEnvironment));
        });
        var actor = fork(__dirname + '/actorProto.js', [true, app.mainIp, port, actorId, app.mainId, app.mainPort, filePath, actorClassName, JSON.stringify(serialisedArgs)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainEnvironment);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    };
    return ServerActor;
}(Actor));
var Application = (function () {
    function Application() {
        this.appActors = 0;
        if (this.appActors == 0) {
            this.mainId = utils.generateId();
            this.mainEnvironment = new ActorEnvironment_1.ActorEnvironment();
            this.mainEnvironment.promisePool = new PromisePool_1.PromisePool();
            this.mainEnvironment.objectPool = new objectPool_1.ObjectPool(this);
        }
        else {
            throw new Error("Cannot create more than one application actor");
        }
    }
    return Application;
}());
var ServerApplication = (function (_super) {
    __extends(ServerApplication, _super);
    function ServerApplication(mainIp, mainPort) {
        if (mainIp === void 0) { mainIp = "127.0.0.1"; }
        if (mainPort === void 0) { mainPort = 8000; }
        var _this = _super.call(this) || this;
        _this.mainIp = mainIp;
        _this.mainPort = mainPort;
        _this.portCounter = 8001;
        _this.spawnedActors = [];
        _this.mainEnvironment.commMedium = new sockets_1.ServerSocketManager(mainIp, mainPort);
        _this.socketManager = _this.mainEnvironment.commMedium;
        _this.mainEnvironment.thisRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, _this.mainId, _this.mainIp, _this.mainPort, _this.mainEnvironment);
        _this.mainEnvironment.gspInstance = new GSP_1.GSP(_this.mainId, _this.mainEnvironment);
        _this.mainEnvironment.signalPool = new signalPool_1.SignalPool(_this.mainEnvironment);
        var mainMessageHandler = new messageHandler_1.MessageHandler(_this.mainEnvironment);
        _this.socketManager.init(mainMessageHandler);
        utils.installSTDLib(true, null, _this, _this.mainEnvironment);
        return _this;
    }
    ServerApplication.prototype.spawnActor = function (actorClass, constructorArgs, port) {
        if (constructorArgs === void 0) { constructorArgs = []; }
        if (port === void 0) { port = -1; }
        var actorObject = new (actorClass.bind.apply(actorClass, [void 0].concat(constructorArgs)))();
        if (port == -1) {
            port = this.portCounter++;
        }
        return actorObject.spawn(this, port, actorClass);
    };
    ServerApplication.prototype.spawnActorFromFile = function (path, className, constructorArgs, port) {
        if (constructorArgs === void 0) { constructorArgs = []; }
        if (port === void 0) { port = -1; }
        if (port == -1) {
            port = this.portCounter++;
        }
        return ServerActor.spawnFromFile(this, port, path, className, constructorArgs);
    };
    ServerApplication.prototype.kill = function () {
        this.socketManager.closeAll();
        this.spawnedActors.forEach(function (actor) {
            actor.kill();
        });
    };
    return ServerApplication;
}(Application));
var ClientApplication = (function (_super) {
    __extends(ClientApplication, _super);
    function ClientApplication() {
        var _this = _super.call(this) || this;
        _this.channelManager = new ChannelManager_1.ChannelManager();
        _this.mainEnvironment.commMedium = _this.channelManager;
        _this.spawnedActors = [];
        _this.mainEnvironment.thisRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, _this.mainId, _this.mainId, _this.mainEnvironment);
        _this.mainEnvironment.gspInstance = new GSP_1.GSP(_this.mainId, _this.mainEnvironment);
        _this.mainEnvironment.signalPool = new signalPool_1.SignalPool(_this.mainEnvironment);
        _this.mainMessageHandler = new messageHandler_1.MessageHandler(_this.mainEnvironment);
        _this.channelManager.init(_this.mainMessageHandler);
        utils.installSTDLib(true, null, _this, _this.mainEnvironment);
        return _this;
    }
    ClientApplication.prototype.spawnActor = function (actorClass, constructorArgs) {
        if (constructorArgs === void 0) { constructorArgs = []; }
        var actorObject = new (actorClass.bind.apply(actorClass, [void 0].concat(constructorArgs)))();
        return actorObject.spawn(this, actorClass);
    };
    ClientApplication.prototype.kill = function () {
        this.spawnedActors.forEach(function (workerPair) {
            workerPair[1].terminate();
            URL.revokeObjectURL(workerPair[1]);
        });
        this.spawnedActors = [];
    };
    return ClientApplication;
}(Application));
exports.Repliq = Repliq_1.Repliq;
exports.Signal = signal_1.SignalObject;
exports.mutator = signal_1.mutator;
exports.atomic = Repliq_1.atomic;
exports.lease = signal_1.lease;
exports.strong = signal_1.strong;
exports.weak = signal_1.weak;
exports.LWR = RepliqPrimitiveField_1.LWR;
exports.Count = RepliqPrimitiveField_1.Count;
exports.RepliqPrimitiveField = RepliqPrimitiveField_1.RepliqPrimitiveField;
exports.RepliqObjectField = RepliqObjectField_1.RepliqObjectField;
exports.makeAnnotation = RepliqPrimitiveField_1.makeAnnotation;
exports.FieldUpdate = RepliqField_1.FieldUpdate;
exports.Isolate = Isolate;
if (utils.isBrowser()) {
    exports.Application = ClientApplication;
    exports.Actor = ClientActor;
}
else {
    exports.Application = ServerApplication;
    exports.Actor = ServerActor;
}

}).call(this,"/src")
},{"./ActorEnvironment":52,"./ChannelManager":53,"./PromisePool":54,"./Reactivivity/signal":61,"./Reactivivity/signalPool":62,"./Replication/GSP":63,"./Replication/Repliq":64,"./Replication/RepliqField":65,"./Replication/RepliqObjectField":66,"./Replication/RepliqPrimitiveField":67,"./actorProto":69,"./farRef":71,"./messageHandler":72,"./messages":73,"./objectPool":74,"./serialisation":75,"./sockets":76,"./utils":78,"webworkify":49}],78:[function(require,module,exports){
(function (process){
Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("./spiders");
const signal_1 = require("./Reactivivity/signal");
const SubClient_1 = require("./PubSub/SubClient");
const SubTag_1 = require("./PubSub/SubTag");
const SubServer_1 = require("./PubSub/SubServer");
const QPROP_1 = require("./Reactivivity/QPROP");
/**
 * Created by flo on 05/12/2016.
 */
function isBrowser() {
    var isNode = false;
    if (typeof process === 'object') {
        if (typeof process.versions === 'object') {
            if (typeof process.versions.node !== 'undefined') {
                isNode = true;
            }
        }
    }
    return !(isNode);
}
exports.isBrowser = isBrowser;
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.generateId = generateId;
//Clone function comes from stack overflow thread:
//http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function cloneDR(o) {
    const gdcc = "__getDeepCircularCopy__";
    if (o !== Object(o)) {
        return o; // primitive value
    }
    var set = gdcc in o, cache = o[gdcc], result;
    if (set && typeof cache == "function") {
        return cache();
    }
    // else
    o[gdcc] = function () { return result; }; // overwrite
    if (o instanceof Array) {
        result = [];
        for (var i = 0; i < o.length; i++) {
            result[i] = cloneDR(o[i]);
        }
    }
    else if (o instanceof Function) {
        result = o;
    }
    else {
        result = {};
        Reflect.ownKeys(o).forEach((k) => {
            if (k != gdcc) {
                result[k] = cloneDR(o[k]);
            }
            else if (set) {
                result[k] = cloneDR(cache);
            }
        });
    }
    /*for (var prop in o)
        if (prop != gdcc)
            result[prop] = cloneDR(o[prop]);
        else if (set)
            result[prop] = cloneDR(cache);
}*/
    if (set) {
        o[gdcc] = cache; // reset
    }
    else {
        delete o[gdcc]; // unset again
    }
    return result;
}
exports.cloneDR = cloneDR;
//REALLY ugly way of checking whether we have reached the end of the prototype chain while cloning
function isLastPrototype(object) {
    return object == null;
}
function clone(object) {
    let base = cloneDR(object);
    function walkProto(proto, last) {
        if (!(isLastPrototype(proto))) {
            let protoClone = cloneDR(proto);
            Reflect.setPrototypeOf(last, protoClone);
            walkProto(Reflect.getPrototypeOf(proto), protoClone);
        }
    }
    walkProto(Reflect.getPrototypeOf(object), base);
    return base;
}
exports.clone = clone;
function getInitChain(behaviourObject, result) {
    var properties = Reflect.ownKeys(behaviourObject);
    //Have reached base level object, end of prototype chain (ugly but works)
    if (properties.indexOf("init") != -1) {
        result.unshift(Reflect.get(behaviourObject, "init"));
    }
    if (properties.indexOf("valueOf") != -1) {
        return result;
    }
    else {
        return getInitChain(behaviourObject.__proto__, result);
    }
}
const CONSTRAINT_OK = "ok";
function checkRegularLiftConstraints(...liftArgs) {
    let someGarbage = false;
    liftArgs.forEach((a) => {
        if (a instanceof signal_1.SignalValue) {
            someGarbage = someGarbage || a.holder.isGarbage;
        }
    });
    if (someGarbage) {
        return "Cannot use regular lift (i.e. lift/liftStrong/liftStrong) on signal part of garbage dependency graph";
    }
    else {
        return CONSTRAINT_OK;
    }
}
function checkFailureLiftConstraints(...liftArgs) {
    let someStrong = false;
    liftArgs.forEach((a) => {
        if (a instanceof signal_1.SignalValue) {
            someStrong = someStrong || a.holder.strong;
        }
    });
    if (someStrong) {
        return "Calling failure lift on strong signal (which will never propagate garbage collection event)";
    }
    else {
        return CONSTRAINT_OK;
    }
}
function checkStrongLiftConstraints(...liftArgs) {
    let allStrong = true;
    liftArgs.forEach((a) => {
        if (a instanceof signal_1.SignalValue) {
            allStrong = allStrong && a.holder.strong;
        }
    });
    if (allStrong) {
        return CONSTRAINT_OK;
    }
    else {
        return "Trying to create strong lifted signal with a weak dependency";
    }
}
function installSTDLib(appActor, parentRef, behaviourObject, environment) {
    let commMedium = environment.commMedium;
    let thisRef = environment.thisRef;
    let promisePool = environment.promisePool;
    let signalPool = environment.signalPool;
    let gspInstance = environment.gspInstance;
    if (!appActor) {
        behaviourObject["parent"] = parentRef.proxyify();
    }
    behaviourObject["remote"] = (address, port) => {
        return commMedium.connectRemote(thisRef, address, port, promisePool);
    };
    behaviourObject["Isolate"] = spiders_1.Isolate;
    behaviourObject["ArrayIsolate"] = spiders_1.ArrayIsolate;
    ///////////////////
    //Pub/Sub       //
    //////////////////
    behaviourObject["PSClient"] = ((serverAddress = "127.0.0.1", serverPort = 8000) => {
        let psClient = new SubClient_1.PSClient(serverAddress, serverPort, behaviourObject);
        behaviourObject["publish"] = psClient.publish.bind(psClient);
        behaviourObject["subscribe"] = psClient.subscribe.bind(psClient);
        behaviourObject["newPublished"] = psClient.newPublished.bind(psClient);
    });
    behaviourObject["newPSTag"] = ((name) => {
        return new SubTag_1.PubSubTag(name);
    });
    behaviourObject["PSServer"] = ((serverAddress = "127.0.0.1", serverPort = 8000) => {
        let psServer = new SubServer_1.PSServer(serverAddress, serverPort);
        behaviourObject["addPublish"] = psServer.addPublish.bind(psServer);
        behaviourObject["addSubscriber"] = psServer.addSubscriber.bind(psServer);
    });
    ///////////////////
    //Replication   //
    //////////////////
    behaviourObject["newRepliq"] = ((repliqClass, ...args) => {
        let repliqOb = new repliqClass(...args);
        return repliqOb.instantiate(gspInstance, thisRef.ownerId);
    });
    ///////////////////
    //Reactivity   //
    //////////////////
    behaviourObject["QPROP"] = (ownType, directParents, directChildren, defaultValue) => {
        let qNode = new QPROP_1.QPROPNode(ownType, directParents, directChildren, behaviourObject, defaultValue);
        environment.signalPool.installDPropAlgorithm(qNode);
        let qNodeSignal = qNode.ownSignal;
        let signal = new signal_1.Signal(qNodeSignal);
        qNodeSignal.setHolder(signal);
        qNodeSignal.instantiateMeta(environment);
        signalPool.newSource(signal);
        return behaviourObject["lift"]((qSignal) => {
            return qSignal.parentVals;
        })(qNodeSignal);
    };
    behaviourObject["newSignal"] = (signalClass, ...args) => {
        let sigVal = new signalClass(...args);
        let signal = new signal_1.Signal(sigVal);
        sigVal.setHolder(signal);
        sigVal.instantiateMeta(environment);
        signalPool.newSource(signal);
        return signal.value;
    };
    //Automatically converts the resulting signal to weak if one of the dependencies is weak (leaves signal as strong otherwise)
    behaviourObject["lift"] = (func) => {
        let inner = signal_1.lift(func);
        return (...args) => {
            let constraintsOk = checkRegularLiftConstraints(...args);
            if (constraintsOk == CONSTRAINT_OK) {
                let sig = inner(...args);
                let allStrong = true;
                sig.signalDependencies.forEach((dep) => {
                    allStrong = allStrong && dep.signal.strong;
                });
                if (!allStrong) {
                    signalPool.newSignal(sig);
                    sig.value.setHolder(sig);
                    sig.makeWeak();
                    return sig.value;
                }
                else {
                    signalPool.newSignal(sig);
                    sig.value.setHolder(sig);
                    return sig.value;
                }
            }
            else {
                throw new Error(constraintsOk);
            }
        };
    };
    //Re-wrap the lift function to catch creation of new signals as the result of lifted function application
    behaviourObject["liftStrong"] = (func) => {
        let inner = signal_1.lift(func);
        return (...args) => {
            let regularConstraints = checkRegularLiftConstraints(...args);
            if (regularConstraints == CONSTRAINT_OK) {
                let sig = inner(...args);
                let constraint = checkStrongLiftConstraints(...args);
                if (constraint != CONSTRAINT_OK) {
                    throw new Error(constraint);
                }
                else {
                    signalPool.newSignal(sig);
                    sig.value.setHolder(sig);
                    return sig.value;
                }
            }
            else {
                throw new Error(regularConstraints);
            }
        };
    };
    behaviourObject["liftWeak"] = (func) => {
        let inner = signal_1.lift(func);
        return (...args) => {
            let constraints = checkRegularLiftConstraints(...args);
            if (constraints == CONSTRAINT_OK) {
                let sig = inner(...args);
                signalPool.newSignal(sig);
                sig.value.setHolder(sig);
                sig.makeWeak();
                return sig.value;
            }
            else {
                throw new Error(constraints);
            }
        };
    };
    behaviourObject["liftFailure"] = (func) => {
        let inner = signal_1.liftGarbage(func);
        return (...args) => {
            let constraint = checkFailureLiftConstraints(...args);
            if (constraint == CONSTRAINT_OK) {
                let sig = inner(...args);
                signalPool.newGarbageSignal(sig);
                args.forEach((a) => {
                    if (a instanceof signal_1.SignalValue) {
                        if (!a.holder.isGarbage) {
                            signalPool.addGarbageDependency(a.holder.id, sig.id);
                        }
                    }
                });
                sig.value.setHolder(sig);
                return sig.value;
            }
            else {
                throw new Error(constraint);
            }
        };
    };
    if (!appActor) {
        var initChain = getInitChain(behaviourObject, []);
        initChain.forEach((initFunc) => {
            initFunc.apply(behaviourObject, []);
        });
    }
}
exports.installSTDLib = installSTDLib;

}).call(this,require('_process'))
},{"./PubSub/SubClient":55,"./PubSub/SubServer":56,"./PubSub/SubTag":57,"./Reactivivity/QPROP":59,"./Reactivivity/signal":61,"./spiders":77,"_process":25}]},{},[2]);
