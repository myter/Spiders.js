/**
 * Created by flo on 18/01/2017.
 */
var spider = require("../src/spiders")
/**
 * Created by flo on 10/01/2017.
 */
var scheduled = []
class testApp extends spider.Application{
    constructor(){
        super()
        this.mainValue = 10
        this.field = 10
    }

    mainMethod(){
        return 10
    }

    getGUI(){
        return window.guiField
    }
}
var app = new testApp()

function log(result){
    if(result.includes("false")){
        throw new Error("Something went wrong with: " + result)
    }
    else{
        console.log("[TESTING] " + result + " [TESTING]")
    }
}

class testFieldSerActor extends spider.Actor{
    constructor(){
        super()
        this.val = 10
    }
}
var performFieldSer = () => {
    var fieldActor = app.spawnActor(testFieldSerActor)
    return fieldActor.val.then((v) => {
        log("Field Serialisation: " + (v == 10))
        app.kill()
    })
}
scheduled.push(performFieldSer)


class testMethSerActor extends spider.Actor{
    msub(){
        return 5
    }
    m(){
        return this.msub() + 5
    }
}
var performMethSer = () => {
    var methActor = app.spawnActor(testMethSerActor)
    return methActor.m().then((v) => {
        log("Method Serialisaton: " + (v == 10))
        app.kill()
    })
}
scheduled.push(performMethSer)


var aValue = 5
class testConSerActor extends spider.Actor{
    constructor(){
        super()
        this.val = aValue
    }
    test(){
        return this.val
    }
}
var performConSer = () => {
    var actor = app.spawnActor(testConSerActor)
    return actor.test().then((v) => {
        log("Construction: " + (v == aValue))
        app.kill()
    })
}
scheduled.push(performConSer)


class testInitSerActor extends spider.Actor{
    constructor(){
        super()
        this.val = 10
    }
    init(){
        this.val += 5
    }
}
var peformInitSer = () => {
    var actor = app.spawnActor(testInitSerActor)
    return actor.val.then((v) => {
        log("Initialisation: " + (v == 15))
        app.kill()
    })
}
scheduled.push(peformInitSer)


class testScopeActor extends spider.Actor{
    get(){
        return this.promisePool
    }
}
performScopeSer = () => {
    var actor = app.spawnActor(testScopeActor)
    return actor.get().then((v) => {
        log("Scope: " + (v == undefined))
        app.kill()
    })
}
scheduled.push(performScopeSer)

class baseMethodInhActor extends spider.Actor{
    test(){
        return 5
    }
}
class inhActor extends baseMethodInhActor{
    testInh(){
        return this.test()
    }
}
performMethodInhSer = () => {
    var actor = app.spawnActor(inhActor)
    return actor.testInh().then((v) => {
        log("Inheritance (Method): " + (v == 5))
        app.kill()
    })
}
scheduled.push(performMethodInhSer)


class baseFieldInhActor extends spider.Actor{
    constructor(){
        super()
        this.baseField = 5
    }
}
class fieldInhActor extends baseFieldInhActor{

}
performFieldInhSer = () => {
    var actor = app.spawnActor(fieldInhActor)
    return actor.baseField.then((v) => {
        log("Inheritance (Field): " + (v == 5))
        app.kill()
    })
}
scheduled.push(performFieldInhSer)




//Due to Browserify's static analyser it is impossible to dynamically require a module. therefore require must happen on actor creation time (the required library is available to the actor is a far reference)
//Warning, this entails that all work done by the required librarby is performed on the spawning thread (use importscripts if needed to require in actor self)
class testReqActor extends spider.Actor{
    constructor(){
        super()
        this.mod = require('/Users/flo/WebstormProjects/Spiders.js/client-tests/clientTestModule')
    }
    invoke(){
        return this.mod.testFunction()
    }
}
performReq = () => {
    var actor = app.spawnActor(testReqActor)
    return actor.invoke().then((v) => {
        log("Require: " + (v == 5))
        app.kill()
    })
}
scheduled.push(performReq)


class testFieldAccessActor extends spider.Actor{
    constructor(){
        super()
        this.value = 10
    }
}
performFieldAccess = () => {
    var actor = app.spawnActor(testFieldAccessActor)
    return actor.value.then((value) => {
        log("Accessing actor instance variable: " + (value == 10))
        app.kill()
    })
}
scheduled.push(performFieldAccess)


class testMethodInvocActor extends spider.Actor{
    m(){
        return 10
    }
}
performMethodInvoc = () => {
    var actor = app.spawnActor(testMethodInvocActor)
    return actor.m().then((retVal) => {
        log("Invoking method on far reference: " + (retVal == 10))
        app.kill()
    })
}
scheduled.push(performMethodInvoc)


class testParentAccessActor extends spider.Actor{
    access(){
        return parent.mainValue
    }
}
performParentAccess = () => {
    var actor = app.spawnActor(testParentAccessActor)
    return actor.access().then((v) => {
        log("Actor accessing main instance variable: " + (v == 10))
        app.kill()
    })
}
scheduled.push(performParentAccess)


class testParentInvokeActor extends spider.Actor{
    invoke(){
        return parent.mainMethod()
    }
}
performParentInvoke = () => {
    var actor = app.spawnActor(testParentInvokeActor)
    return actor.invoke().then((v) => {
        log("Actor invoking main method: " + (v == 10))
        app.kill()
    })
}
scheduled.push(performParentInvoke)

class testPromiseRejectActor extends spider.Actor{
    m(){
        throw new Error("This is an error")
    }
}
performPromiseReject = () => {
    var actor = app.spawnActor(testPromiseRejectActor)
    return actor.m().catch((reason) => {
        log("Promise rejection handling (method invocation): " + (reason.message == "This is an error"))
        app.kill()
    })
}
scheduled.push(performPromiseReject)


class testPromisePipeActor extends spider.Actor{
    get(){
        return parent.field
    }
}
performPromisePipe = () => {
    var actor = app.spawnActor(testPromisePipeActor)
    return actor.get().then((val) => {
        log("Promise pipelining (field access)" + (val == 10))
        app.kill()
    })
}
scheduled.push(performPromisePipe)


class testPromiseInvocPipeActor extends spider.Actor{
    get(){
        return parent.mainMethod()
    }
}
performPromiseInvocPipe = () => {
    var actor = app.spawnActor(testPromiseInvocPipeActor)
    return actor.get().then((val) => {
        log("Promise pipelining (method invocation): " + (val == 10))
        app.kill()
    })
}
scheduled.push(performPromiseInvocPipe)


class mIsolate extends spider.Isolate{
    constructor(){
        super()
        this.field = 6
    }
    m(){
        return 5
    }
}

class testIsolateActor extends spider.Actor{
    constructor(){
        super()
        this.mIsolate = mIsolate
    }
    getIsolate(){
        return new this.mIsolate()
    }
}
performIsolate = () => {
    var actor = app.spawnActor(testIsolateActor)
    return actor.getIsolate().then((isol) => {
        log("Isolate passing: " + (isol.field == 6) + " ," + (isol.m() == 5))
        app.kill()
    })
}
scheduled.push(performIsolate)

class innerIsolate extends spider.Isolate {
    constructor(){
        super()
        this.innerField = 5
    }
}
class outerIsolate extends spider.Isolate {
    constructor() {
        super();
        this.outerField = 6
        this.innerIsol = new innerIsolate()

    }
    getOuterField(){
        return outerField
    }
    getInnerIsolate(){
        return innerIsol
    }
}

var app = new testApp();
class testNestedIsolateActor extends spider.Actor {
    constructor(){
        super();
        this.mIsolate = new outerIsolate();
    }
    getIsolate(){
        return this.mIsolate
    }
}
performNestedIsolate = () => {
    var actor = app.spawnActor(testNestedIsolateActor);
    return actor.getIsolate().then((isol) => {
        log("Nested Isolate passing: " + (isol.getOuterField() == 6) + " , " + (isol.getInnerIsolate().innerField == 5))
        app.kill()
    })
}
scheduled.push(performNestedIsolate)


class testNumSerActor extends spider.Actor{
    compute(num){
        return num + 5
    }
}
performNumSer = () => {
    var actor = app.spawnActor(testNumSerActor)
    return actor.compute(5).then((val) => {
        log("Correct serialisation of numeric values: " + (val == 10))
        app.kill()
    })
}
scheduled.push(performNumSer)


class testStringSerActor extends spider.Actor{
    append(str){
        return str + 5
    }
}
performStringSer = () => {
    var actor = app.spawnActor(testStringSerActor)
    return actor.append("5").then((val) => {
        log("Correct serialisation of string values: " + (val == 55))
        app.kill()
    })
}
scheduled.push(performStringSer)


class testBoolSerActor extends spider.Actor{
    test(bool){
        if(bool){
            return "ok"
        }
        else{
            return "nok"
        }
    }
}
performBoolSer = () => {
    var actor = app.spawnActor(testBoolSerActor)
    return actor.test(false).then((val) => {
        log("Correct serialisation of boolean values: " + (val == "nok"))
        app.kill()
    })
}
scheduled.push(performBoolSer)



class testUserPromActor extends spider.Actor{
    async(){
        return new Promise((resolve,reject) => {
            setTimeout(() => {
                resolve(5)
            },200)
        })
    }
}
performUserProm = () => {
    var actor = app.spawnActor(testUserPromActor)
    return actor.async().then((val) => {
        log("User-level promise serialisation: " + (val == 5))
        app.kill()
    })
}
scheduled.push(performUserProm)


class testArgSerActor extends spider.Actor{
    m(num,str,bool){
        return [num,str,bool]
    }
}
performArgSer = () => {
    var actor = app.spawnActor(testArgSerActor)
    return actor.m(1,"1",true).then((retArr) => {
        log("Method argument serialisation: " + (retArr[0] == 1) + " , " + (retArr[1] == "1") + " , " + retArr[2] )
        app.kill()
    })
}
scheduled.push(performArgSer)


var ob = {
    field : 5
}
class testLexObActor extends spider.Actor{
    constructor(){
        super()
        this.farRef = ob
    }
    test(){
        return this.farRef.field
    }
}
performLexOb = () => {
    var actor = app.spawnActor(testLexObActor)
    return actor.test().then((v) => {
        log("Lexical object serialisation during construction:  " + (v == ob.field))
        app.kill()
    })
}
scheduled.push(performLexOb)


class testFarRefActor1 extends spider.Actor{
    constructor(){
        super()
        this.value = 666
    }
}
class testFarRefActor2 extends spider.Actor{
    obtainAndAccess(farRef){
        return farRef.value
    }
}
performFarRef = () => {
    var actor1 = app.spawnActor(testFarRefActor1)
    var actor2 = app.spawnActor(testFarRefActor2)
    return actor2.obtainAndAccess(actor1).then((v) => {
        log("Far ref serialisation: " + (v == 666))
        app.kill()
    })
}
scheduled.push(performFarRef)

class testGUIActor extends spider.Actor{
    getField(){
        return parent.getGUI()
    }
}
performGUI = () => {
    var actor = app.spawnActor(testGUIActor)
    return actor.getField().then((v) => {
        log("GUI: " + (v == "guiField"))
        app.kill()
    })
}
scheduled.push(performGUI)

class testReferencePassing_ReferencedActor extends spider.Actor {
    setValue(x) { this.x = x; }
    getValue() { return this.x; }
}
class testReferencePassing_ReferencingActor extends spider.Actor {
    constructor(ref) {
        super();
        this.actorreference = ref;
    }
    init() {
        this.actorreference.setValue(0);
    }
    getValue() { return this.actorreference.getValue()}
}
performActorReferencePassingTest = () => {
    var actor1 = app.spawnActor(testReferencePassing_ReferencedActor);
    var actor2 = app.spawnActor(testReferencePassing_ReferencingActor, [actor1], 8081);
    return actor2.getValue().then((v) => {
        log("Actor reference passing and referencing in init: " + (v == 0))
        app.kill()
    })
}
scheduled.push(performActorReferencePassingTest)

class arrayIsolate1 extends spider.Actor{
    getArrayLength(arr){
        return arr.length
    }
}
class arrayIsolate2 extends spider.Actor{
    sendArray(ref){
        return ref.getArrayLength(new this.ArrayIsolate([1,2,3,4,5]))
    }
}
performArrayIsolateTest = () =>{
    var actor1 = app.spawnActor(arrayIsolate1)
    var actor2 = app.spawnActor(arrayIsolate2)
    return actor2.sendArray(actor1).then((v)=>{
        log("Array Isolate passing : " + (v == 5))
    })
}
scheduled.push(performArrayIsolateTest)

function performAll(nextTest){
    nextTest().then((dc) => {
        if(scheduled.length > 0) {
            performAll(scheduled.pop())
        }
    })
}
performAll(scheduled.pop())

