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
