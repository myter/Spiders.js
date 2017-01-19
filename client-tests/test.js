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

class testFieldSerActor extends app.Actor{
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


class testMethSerActor extends app.Actor{
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
class testConSerActor extends app.Actor{
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


class testInitSerActor extends app.Actor{
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


class testScopeActor extends app.Actor{
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

class baseMethodInhActor extends app.Actor{
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


class baseFieldInhActor extends app.Actor{
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
class testReqActor extends app.Actor{
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


class testFieldAccessActor extends app.Actor{
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


class testMethodInvocActor extends app.Actor{
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


class testParentAccessActor extends app.Actor{
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


class testParentInvokeActor extends app.Actor{
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

class testPromiseRejectActor extends app.Actor{
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


class testPromisePipeActor extends app.Actor{
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


class testPromiseInvocPipeActor extends app.Actor{
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
var app = new testApp()
class testIsolateActor extends app.Actor{
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

class testNumSerActor extends app.Actor{
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


class testStringSerActor extends app.Actor{
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


class testBoolSerActor extends app.Actor{
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



class testUserPromActor extends app.Actor{
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


class testArgSerActor extends app.Actor{
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
class testLexObActor extends app.Actor{
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


class testFarRefActor1 extends app.Actor{
    constructor(){
        super()
        this.value = 666
    }
}
class testFarRefActor2 extends app.Actor{
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

class testGUIActor extends app.Actor{
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

function performAll(nextTest){
    nextTest().then((dc) => {
        if(scheduled.length > 0) {
            performAll(scheduled.pop())
        }
    })
}
performAll(scheduled.pop())

