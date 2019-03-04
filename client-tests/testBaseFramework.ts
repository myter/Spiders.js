import {
    Application, Actor, SpiderIsolate, SpiderIsolateMirror, SpiderObject, SpiderObjectMirror, SpiderActorMirror,
    bundleScope, LexScope, FarRef, makeMethodAnnotation
} from "../src/spiders"
/**
 * Created by flo on 10/01/2017.
 */
var scheduled = []
class testApp extends Application{
    mainValue
    field
    constructor(){
        super()
        this.mainValue = 10
        this.field = 10
    }

    mainMethod(){
        return 10
    }

    getGUI(){
        return (window as any).guiField
    }
}
var app = new testApp()

function log(testName,result,expected){
    var ul = document.getElementById("resultList");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(testName + ". Expected: " + expected + " . Result : " + result));
    li.setAttribute("id", "element4"); // added line
    if(result == expected){
        li.style.color = "Green";

    }
    else{
        li.style.color = "Red";
    }
    ul.appendChild(li);
}
class TestIntroIsol extends SpiderIsolate{
    field = 666

    meth(){
        return 999
    }
}

class ActorMod extends Actor{
    test(){
        let ob = {testOb: true,val: 666}
        let id = this.libs.reflectOnActor().addObject(ob)
        return (this.libs.reflectOnActor().getObject(id) as any).val == 666
    }
}
let actorMod = ()=>{
    let app = new Application()
    let act : FarRef<any> = app.spawnActor(ActorMod)
    return act.test().then((v)=>{
        log("Actor Self Modification",v,true)
    })
}
scheduled.push(actorMod)

class ActorIntroApp extends Application{
    test(ob){//dummy
    }
}
class ActorIntro extends Actor{
    test(){
        let ob = {testOb: true,val: 666}
        this.parent.test(ob)
        return this.libs.reflectOnActor().getObjects().filter(({id:i,object:o})=>{
            return (o as any).testOb && (o as any).val == 666
        }).length == 1
    }
}
let actorIntro = ()=>{
    let app = new ActorIntroApp()
    let act : FarRef<any> = app.spawnActor(ActorIntro)
    return act.test().then((v)=>{
        log("Actor Introspection",v,true)
    })
}
scheduled.push(actorIntro)

class SelfModActor extends Actor{
    test(iso){
        let mirr = this.libs.reflectOnObject(iso)
        mirr.addField("test",999)
        mirr.addMethod("testM",()=>{
            return 666
        })
        return iso.test == 999 && iso.testM() == 666
    }
}
let selfMod = ()=>{
    let app = new Application()
    let act : FarRef<any> = app.spawnActor(SelfModActor)
    return act.test(new TestIntroIsol()).then((v)=>{
        log("Self Modification",v,true)
    })
}
scheduled.push(selfMod)

class IntroSingleActor extends Actor{
    test(iso){
        let mirr = this.libs.reflectOnObject(iso)
        let field = mirr.getField("field")
        let method = mirr.getMethod("meth")
        return field.value == 666 && method.value() == 999
    }
}
let introSingle = ()=>{
    let app = new Application()
    let act : FarRef<any> = app.spawnActor(IntroSingleActor)
    return act.test(new TestIntroIsol()).then((v)=>{
        log("Introspection single",v,true)
    })
}
scheduled.push(introSingle)

class IntroListActor extends Actor{
    test(iso){
        let mirr = this.libs.reflectOnObject(iso)
        let fields = mirr.getFields()
        let methods = mirr.getMethods()
        let hasField  = fields.filter((field)=>{
            return field.name == "field"
        }).length == 1
        let hasMethod = methods.filter((method)=>{
            return method.name == "meth"
        }).length == 1
        return fields.length >= 1 && methods.length >= 1 && hasField && hasMethod
    }
}
let introspectList = ()=>{
    let app = new Application()
    let act : FarRef<any> = app.spawnActor(IntroListActor)
    return act.test(new TestIntroIsol()).then((v)=>{
        log("Introspection List all",v,true)
    })
}
scheduled.push(introspectList)

let annot = makeMethodAnnotation((mirror)=>{
        (mirror as any).value = 666
    }
)
class TestObject extends SpiderIsolate{

    @annot
    meth(){

    }
}
class AnnotSerApp extends Application{
    send(toRef){
        return toRef.getIsol(new TestObject())
    }
}
class AnnotSerActor extends Actor{
    getIsol(i){
        i.meth()
        return (this.libs.reflectOnObject(i) as any).value
    }
}
let annotSer = ()=>{
    let app = new AnnotSerApp()
    let act : FarRef<any> = app.spawnActor(AnnotSerActor)
    return app.send(act).then((v)=>{
        log("Annotation Serialisation",v,666)
    })
}
scheduled.push(annotSer)


class AnnotActor extends Actor{
    TestObject

    constructor(){
        super()
        this.TestObject = TestObject
    }

    test(){
        let t = new this.TestObject()
        t.meth()
        return (this.libs.reflectOnObject(t) as any).value
    }
}
let annotRun = ()=>{
    let act : FarRef<any> = app.spawnActor(AnnotActor)
    return act.test().then((v)=>{
        log("Annotations",v,666)
    })
}
scheduled.push(annotRun)


class ROAMirror extends SpiderActorMirror{
    testValue
    constructor(){
        super()
        this.testValue = 5
    }
}
class ROAActor extends Actor{
    constructor(){
        super(new ROAMirror())
    }

    test(){
        return (this.libs.reflectOnActor() as ROAMirror).testValue
    }
}
let performROA = () =>{
    let act : FarRef<any> = app.spawnActor(ROAActor)
    return act.test().then((v)=>{
        log("Reflecting On Actor",v,5)
    })
}
scheduled.push(performROA)

class InitMirror extends SpiderActorMirror{
    testValue
    initialise(stdLib,appActor,parentRef){
        super.initialise(stdLib,appActor,parentRef)
        this.testValue = 5
    }
}
class InitActor extends Actor{
    testValue
    constructor(){
        super(new InitMirror())
    }

    init(){
        this.testValue = 5
    }

    test(){
        return (this.libs.reflectOnActor() as InitMirror).testValue + this.testValue
    }
}
let customInit = ()=>{
    let act : FarRef<any> = app.spawnActor(InitActor)
    return act.test().then((v)=>{
        log("Custom Init (MAP)",v,10)
    })
}
scheduled.push(customInit)


class CustInvocMAPMirror extends SpiderActorMirror{
    testValue

    receiveInvocation(sender,target,methodName,args,perform,send){
        this.testValue = 5
        super.receiveInvocation(sender,target,methodName,args,perform,send)
    }
}
class CustInvocMAPActor extends Actor{
    testValue
    constructor(){
        super(new CustInvocMAPMirror())
    }
    test(){
        this.testValue = 5
        return (this.libs.reflectOnActor() as CustInvocMAPMirror).testValue + this.testValue
    }
}
let customInvocMap = ()=>{
    let act : FarRef<any> = app.spawnActor(CustInvocMAPActor)
    return act.test().then((v)=>{
        log("Custom Invocation (MAP)",v,10)
    })
}
scheduled.push(customInvocMap)

class custAccessMapMirror extends SpiderActorMirror{
    receiveAccess(sender,target,fieldName,perform){
        target[fieldName]+= 5
        super.receiveAccess(sender,target,fieldName,perform)
    }
}
class custAccessMapActor extends Actor{
    testValue
    constructor(){
        super(new custAccessMapMirror())
        this.testValue = 5
    }
}
let customAccessMap = () => {
    let act : FarRef<any> = app.spawnActor(custAccessMapActor)
    return act.testValue.then((v)=>{
        log("Custom Access (MAP)",v,10)
    })
}
scheduled.push(customAccessMap)


class CustSendInvocMapMirror extends SpiderActorMirror{
    testValue
    sendInvocation(target : FarRef<any>,methodName : string,args : Array<any>,contactId = this.base.thisRef.ownerId,contactAddress = null,contactPort = null,mainId = null){
        this.testValue = 5
        return super.sendInvocation(target,methodName,args,contactId,contactAddress,contactPort,mainId)
    }
}
class CustSendInvocMapApp extends Application{
    testP(){
        return 5
    }
}
class CustSendInvocMapActor extends Actor{
    constructor(){
        super(new CustSendInvocMapMirror())
    }
    test(){
        return this.parent.testP().then((v)=>{
            return (this.libs.reflectOnActor() as CustSendInvocMapMirror).testValue + v
        })
    }
}
let custSendInvocMAP = ()=>{
    let custSendInvocMapAPP = new CustSendInvocMapApp()
    let act : FarRef<any> = custSendInvocMapAPP.spawnActor(CustSendInvocMapActor)
    return act.test().then((v)=>{
        log("Custom Send Invocation (MAP)",v,10)
    })
}
scheduled.push(custSendInvocMAP)

class CustSendAccessMapMirror extends SpiderActorMirror{
    testValue
    sendAccess(target : FarRef<any>,fieldName : string,contactId = this.base.thisRef.ownerId,contactAddress = null,contactPort = null,mainId = null){
        this.testValue = 5
        return super.sendAccess(target,fieldName,contactId,contactAddress,contactPort,mainId)
    }
}
class CustSendAccessMAPApp extends Application{
    testValue
    constructor(){
        super()
        this.testValue = 5
    }
}
class CustSendAccessMapActor extends Actor{
    constructor(){
        super(new CustSendAccessMapMirror())
    }

    test(){
        return this.parent.testValue.then((v)=>{
            return (this.libs.reflectOnActor() as CustSendAccessMapMirror).testValue + v
        })
    }
}
let custSendAccessMap = () =>{
    let custSendAccessMapApp = new CustSendAccessMAPApp()
    let act : FarRef<any> = custSendAccessMapApp.spawnActor(CustSendAccessMapActor)
    return act.test().then((v)=>{
        log("Custom Send Access (MAP)",v,10)
    })
}
scheduled.push(custSendAccessMap)

class ROOMirror extends SpiderObjectMirror{
    testValue
    constructor(){
        super()
        this.testValue = 5
    }
}
class ROOObject extends SpiderObject{
    constructor(mirrorClass){
        super(new mirrorClass())
    }
}
class ROOActor extends Actor{
    TestObject
    TestMirror
    constructor(){
        super()
        this.TestObject = ROOObject
        this.TestMirror = ROOMirror
    }
    test(){
        let o = new this.TestObject(this.TestMirror)
        return (this.libs.reflectOnObject(o) as ROOMirror).testValue
    }
}
let ROO = () => {
    let act : FarRef<any> = app.spawnActor(ROOActor)
    return act.test().then((v)=>{
        log("Reflect On Object",v,5)
    })
}
scheduled.push(ROO)


class CustInvokeMOPMirror extends SpiderObjectMirror{
    testValue
    invoke(methodName,args){
        this.testValue = 5
        return super.invoke(methodName,args)
    }
}
class CustInvokeMOPObject extends SpiderObject{
    constructor(mirrorClass){
        super(new mirrorClass())
    }

    someMethod(){
        return 5
    }
}
class CustInvokeMOPActor extends Actor{
    TestObject
    TestMirror
    constructor(){
        super()
        this.TestObject = CustInvokeMOPObject
        this.TestMirror = CustInvokeMOPMirror
    }
    test(){
        let o = new this.TestObject(this.TestMirror)
        let r = o.someMethod()
        return (this.libs.reflectOnObject(o) as CustInvokeMOPMirror).testValue + r
    }
}
let customInvocMOP = () => {
    let act : FarRef<any> = app.spawnActor(CustInvokeMOPActor)
    return act.test().then((v)=>{
        log("Custom Invoke (MOP)",v,10)
    })
}
scheduled.push(customInvocMOP)

class CustomAccessMopMirror extends SpiderObjectMirror{
    testValue

    access(fieldName){
        this.testValue = 5
        return super.access(fieldName)
    }
}
class CustomAccessMopObject extends SpiderObject{
    someField
    constructor(mirrorClass){
        super(new mirrorClass())
        this.someField = 5
    }
}
class CustomAccessMopActor extends Actor{
    TestObject
    TestMirror
    constructor(){
        super()
        this.TestObject = CustomAccessMopObject
        this.TestMirror = CustomAccessMopMirror
    }
    test(){
        let o = new this.TestObject(this.TestMirror)
        let r = o.someField
        return (this.libs.reflectOnObject(o) as CustomAccessMopMirror).testValue + r
    }
}
let CustomAccessMop = () => {
    let act : FarRef<any> = app.spawnActor(CustomAccessMopActor)
    return act.test().then((v)=>{
        log("Custom Access (MOP)",v,10)
    })
}
scheduled.push(CustomAccessMop)

class custWriteMOPMirror extends SpiderObjectMirror{
    testValue

    write(fieldName,value){
        this.testValue = 5
        this.base[fieldName] = value * 2
        return true
    }
}
class CustomWriteMOPObject extends SpiderObject{
    someField
    constructor(mirrorClass){
        super(new mirrorClass())
        this.someField = 5
    }
}
class CustomWriteMOPActor extends Actor{
    TestObject
    TestMirror
    constructor(){
        super()
        this.TestObject = CustomWriteMOPObject
        this.TestMirror = custWriteMOPMirror
    }
    test(){
        let o = new this.TestObject(this.TestMirror)
        let r = o.someField
        return (this.libs.reflectOnObject(o) as custWriteMOPMirror).testValue + r
    }
}
let CustomWriteMop = () => {
    let act : FarRef<any> = app.spawnActor(CustomWriteMOPActor)
    return act.test().then((v)=>{
        log("Custom Write (MOP)",v,15)
    })
}
scheduled.push(CustomWriteMop)


class CustomPassMopMirror extends SpiderIsolateMirror{
    testValue

    pass(arg){
        this.testValue = 5
        return super.pass(arg)
    }
}
class CustomPassMopObject extends SpiderIsolate{
    constructor(mirrorClass){
        super(new mirrorClass())
    }
}
class CustomPassMopActor extends Actor{
    o
    constructor(){
        super()
        this.o          = new CustomPassMopObject(CustomPassMopMirror)
    }
    test(){
        return (this.libs.reflectOnObject(this.o) as CustomPassMopMirror).testValue
    }
}
let CustomPassMop = () => {
    let act : FarRef<any> = app.spawnActor(CustomPassMopActor)
    return act.test().then((v)=>{
        log("Custom Pass (MOP)",v,5)
    })
}
scheduled.push(CustomPassMop)

class CustomResolveMopMirror extends SpiderIsolateMirror{
    testValue

    resolve(mirr){
        this.testValue = 5
        return super.resolve(mirr)
    }
}
class CustomResolveMopObject extends SpiderIsolate{
    constructor(mirrorClass){
        super(new mirrorClass())
    }
}
class CustomResolveMopActor extends Actor{
    o
    constructor(){
        super()
        this.o          = new CustomResolveMopObject(CustomResolveMopMirror)
    }
    test(){
        return (this.libs.reflectOnObject(this.o) as CustomResolveMopMirror).testValue
    }
}
let CustomResolveMop = () => {
    let act : FarRef<any> = app.spawnActor(CustomResolveMopActor)
    return act.test().then((v)=>{
        log("Custom Resolve (MOP)",v,5)
    })
}
scheduled.push(CustomResolveMop)

class testFieldSerActor extends Actor{
    val
    constructor(){
        super()
        this.val = 10
    }
}
var performFieldSer = () => {
    var fieldActor : FarRef<any> = app.spawnActor(testFieldSerActor)
    return fieldActor.val.then((v) => {
        log("Field Serialisation",v,10)
        app.kill()
    })
}
scheduled.push(performFieldSer)


class testMethSerActor extends Actor{
    msub(){
        return 5
    }
    m(){
        return this.msub() + 5
    }
}
var performMethSer = () => {
    var methActor : FarRef<any> = app.spawnActor(testMethSerActor)
    return methActor.m().then((v) => {
        log("Method Serialisaton",v,10)
        app.kill()
    })
}
scheduled.push(performMethSer)


var aValue = 5
class testConSerActor extends Actor{
    val
    constructor(){
        super()
        this.val = aValue
    }
    test(){
        return this.val
    }
}
var performConSer = () => {
    var actor : FarRef<any> = app.spawnActor(testConSerActor)
    return actor.test().then((v) => {
        log("Construction",v,aValue)
        app.kill()
    })
}
scheduled.push(performConSer)


class testInitSerActor extends Actor{
    val
    constructor(){
        super()
        this.val = 10
    }
    init(){
        this.val += 5
    }
}
var peformInitSer = () => {
    var actor : FarRef<any> = app.spawnActor(testInitSerActor)
    return actor.val.then((v) => {
        log("Initialisation",v,15)
        app.kill()
    })
}
scheduled.push(peformInitSer)


class testScopeActor extends Actor{
    get(){
        return (this as any).promisePool
    }
}
var performScopeSer = () => {
    var actor : FarRef<any> = app.spawnActor(testScopeActor)
    return actor.get().then((v) => {
        log("Scope",v,undefined)
        app.kill()
    })
}
scheduled.push(performScopeSer)

class baseMethodInhActor extends Actor{
    test(){
        return 5
    }
}
class inhActor extends baseMethodInhActor{
    testInh(){
        return this.test()
    }
}
var performMethodInhSer = () => {
    var actor : FarRef<any> = app.spawnActor(inhActor)
    return actor.testInh().then((v) => {
        log("Inheritance (Method)",v,5)
        app.kill()
    })
}
scheduled.push(performMethodInhSer)


class baseFieldInhActor extends Actor{
    baseField
    constructor(){
        super()
        this.baseField = 5
    }
}
class fieldInhActor extends baseFieldInhActor{

}
var performFieldInhSer = () => {
    var actor : FarRef<any> = app.spawnActor(fieldInhActor)
    return actor.baseField.then((v) => {
        log("Inheritance (Field)",v,5)
        app.kill()
    })
}
scheduled.push(performFieldInhSer)




//Due to Browserify's static analyser it is impossible to dynamically require a module. therefore require must happen on actor creation time (the required library is available to the actor is a far reference)
//Warning, this entails that all work done by the required librarby is performed on the spawning thread (use importscripts if needed to require in actor self)
class testReqActor extends Actor{
    mod
    constructor(){
        super()
        this.mod = require('/Users/flo/WebstormProjects/Spiders.js/client-tests/clientTestModule')
    }
    invoke(){
        return this.mod.testFunction()
    }
}
var performReq = () => {
    var actor : FarRef<any> = app.spawnActor(testReqActor)
    return actor.invoke().then((v) => {
        log("Require",v,5)
        app.kill()
    })
}
scheduled.push(performReq)


class testFieldAccessActor extends Actor{
    value
    constructor(){
        super()
        this.value = 10
    }
}
var performFieldAccess = () => {
    var actor : FarRef<any> = app.spawnActor(testFieldAccessActor)
    return actor.value.then((value) => {
        log("Accessing actor instance variable",value,10)
        app.kill()
    })
}
scheduled.push(performFieldAccess)


class testMethodInvocActor extends Actor{
    m(){
        return 10
    }
}
var performMethodInvoc = () => {
    var actor : FarRef<any> = app.spawnActor(testMethodInvocActor)
    return actor.m().then((retVal) => {
        log("Invoking method on far reference",retVal,10)
        app.kill()
    })
}
scheduled.push(performMethodInvoc)


class testParentAccessActor extends Actor{
    access(){
        return this.parent.mainValue
    }
}
var performParentAccess = () => {
    var actor : FarRef<any> = app.spawnActor(testParentAccessActor)
    return actor.access().then((v) => {
        log("Actor accessing main instance variable",v,10)
        app.kill()
    })
}
scheduled.push(performParentAccess)


class testParentInvokeActor extends Actor{
    invoke(){
        return this.parent.mainMethod()
    }
}
var performParentInvoke = () => {
    var actor : FarRef<any> = app.spawnActor(testParentInvokeActor)
    return actor.invoke().then((v) => {
        log("Actor invoking main method",v,10)
        app.kill()
    })
}
scheduled.push(performParentInvoke)

class testPromiseRejectActor extends Actor{
    m(){
        throw new Error("This is an error")
    }
}
var performPromiseReject = () => {
    var actor : FarRef<any> = app.spawnActor(testPromiseRejectActor)
    return actor.m().catch((reason) => {
        log("Promise rejection handling (method invocation)",reason.message,"This is an error")
        app.kill()
    })
}
scheduled.push(performPromiseReject)


class testPromisePipeActor extends Actor{
    get(){
        return this.parent.field
    }
}
var performPromisePipe = () => {
    var actor : FarRef<any> = app.spawnActor(testPromisePipeActor)
    return actor.get().then((val) => {
        log("Promise pipelining (field access)",val,10)
        app.kill()
    })
}
scheduled.push(performPromisePipe)


class testPromiseInvocPipeActor extends Actor{
    get(){
        return this.parent.mainMethod()
    }
}
var performPromiseInvocPipe = () => {
    var actor : FarRef<any> = app.spawnActor(testPromiseInvocPipeActor)
    return actor.get().then((val) => {
        log("Promise pipelining (method invocation)",val,10)
        app.kill()
    })
}
scheduled.push(performPromiseInvocPipe)


class mIsolate extends SpiderIsolate{
    field
    constructor(){
        super()
        this.field = 6
    }
    m(){
        return 5
    }
}

class testIsolateActor extends Actor{
    mIsolate
    constructor(){
        super()
        this.mIsolate = mIsolate
    }
    getIsolate(){
        return new this.mIsolate()
    }
}
var performIsolate = () => {
    var actor : FarRef<any> = app.spawnActor(testIsolateActor)
    return actor.getIsolate().then((isol) => {
        log("Isolate passing",isol.field,6)
        log("Isolate passing2",isol.m(),5)
        app.kill()
    })
}
scheduled.push(performIsolate)

class innerIsolate extends SpiderIsolate {
    innerField
    constructor(){
        super()
        this.innerField = 5
    }
}
class outerIsolate extends SpiderIsolate {
    outerField
    innerIsol
    constructor() {
        super();
        this.outerField = 6
        this.innerIsol = new innerIsolate()

    }
    getOuterField(){
        return this.outerField
    }
    getInnerIsolate(){
        return this.innerIsol
    }
}

var app = new testApp();
class testNestedIsolateActor extends Actor {
    mIsolate
    constructor(){
        super();
        this.mIsolate = new outerIsolate();
    }
    getIsolate(){
        return this.mIsolate
    }
}
var performNestedIsolate = () => {
    var actor : FarRef<any> = app.spawnActor(testNestedIsolateActor);
    return actor.getIsolate().then((isol) => {
        log("Nested Isolate passing",isol.getOuterField(),6)
        log("Nested Isolate passing2",isol.getInnerIsolate().innerField,5)
        app.kill()
    })
}
scheduled.push(performNestedIsolate)


class testNumSerActor extends Actor{
    compute(num){
        return num + 5
    }
}
var performNumSer = () => {
    var actor : FarRef<any> = app.spawnActor(testNumSerActor)
    return actor.compute(5).then((val) => {
        log("Correct serialisation of numeric values",val,10)
        app.kill()
    })
}
scheduled.push(performNumSer)


class testStringSerActor extends Actor{
    append(str){
        return str + 5
    }
}
var performStringSer = () => {
    var actor : FarRef<any> = app.spawnActor(testStringSerActor)
    return actor.append("5").then((val) => {
        log("Correct serialisation of string values",val,55)
        app.kill()
    })
}
scheduled.push(performStringSer)


class testBoolSerActor extends Actor{
    test(bool){
        if(bool){
            return "ok"
        }
        else{
            return "nok"
        }
    }
}
var performBoolSer = () => {
    var actor : FarRef<any> = app.spawnActor(testBoolSerActor)
    return actor.test(false).then((val) => {
        log("Correct serialisation of boolean values",val,"nok")
        app.kill()
    })
}
scheduled.push(performBoolSer)

class testUserPromActor extends Actor{
    async(){
        return new Promise((resolve,reject) => {
            setTimeout(() => {
                resolve(5)
            },200)
        })
    }
}
var performUserProm = () => {
    var actor : FarRef<any> = app.spawnActor(testUserPromActor)
    return actor.async().then((val) => {
        log("User-level promise serialisation",val,5)
        app.kill()
    })
}
scheduled.push(performUserProm)

class TestMapActor extends Actor{
    m
    constructor(){
        super()
        this.m = new Map()
        this.m.set("native",5)
        this.m.set("object",{x:5})
    }

    test(){
        let nat = this.m.get("native")
        return this.m.get("object").x.then((xVal)=>{
            return xVal + nat
        })
    }
}
let performMap = () => {
    let act : FarRef<any> = app.spawnActor(TestMapActor)
    return act.test().then((v)=>{
        log("Map serialisation",v,10)
        app.kill()
    })
}
scheduled.push(performMap)

class testArgSerActor extends Actor{
    m(num,str,bool){
        return [num,str,bool]
    }
}
var performArgSer = () => {
    var actor : FarRef<any> = app.spawnActor(testArgSerActor)
    return actor.m(1,"1",true).then((retArr) => {
        log("Method argument serialisation",retArr[0],1)
        log("Method argument serialisation",retArr[1],"1")
        log("Method argument serialisation",retArr[2],true)
        app.kill()
    })
}
scheduled.push(performArgSer)


var ob = {
    field : 5
}
class testLexObActor extends Actor{
    farRef
    constructor(){
        super()
        this.farRef = ob
    }
    test(){
        return this.farRef.field
    }
}
var performLexOb = () => {
    var actor : FarRef<any> = app.spawnActor(testLexObActor)
    return actor.test().then((v) => {
        log("Lexical object serialisation during construction",v,ob.field)
        app.kill()
    })
}
scheduled.push(performLexOb)


class testFarRefActor1 extends Actor{
    value
    constructor(){
        super()
        this.value = 666
    }
}
class testFarRefActor2 extends Actor{
    obtainAndAccess(farRef){
        return farRef.value
    }
}
var performFarRef = () => {
    var actor1 = app.spawnActor(testFarRefActor1)
    var actor2 : FarRef<any> = app.spawnActor(testFarRefActor2)
    return actor2.obtainAndAccess(actor1).then((v) => {
        log("Far ref serialisation",v,666)
        app.kill()
    })
}
scheduled.push(performFarRef)

class testGUIActor extends Actor{
    getField(){
        return this.parent.getGUI()
    }
}
var performGUI = () => {
    var actor : FarRef<any> = app.spawnActor(testGUIActor)
    return actor.getField().then((v) => {
        log("GUI",v,"guiField")
        app.kill()
    })
}
scheduled.push(performGUI)

class testReferencePassing_ReferencedActor extends Actor {
    x
    setValue(x) { this.x = x; }
    getValue() { return this.x; }
}
class testReferencePassing_ReferencingActor extends Actor {
    actorreference
    constructor(ref) {
        super();
        this.actorreference = ref;
    }
    init() {
        this.actorreference.setValue(0);
    }
    getValue() { return this.actorreference.getValue()}
}
var performActorReferencePassingTest = () => {
    var actor1 = app.spawnActor(testReferencePassing_ReferencedActor);
    var actor2 : FarRef<any> = app.spawnActor(testReferencePassing_ReferencingActor, [actor1], 8081);
    return actor2.getValue().then((v) => {
        log("Actor reference passing and referencing in init",v,0)
        app.kill()
    })
}
scheduled.push(performActorReferencePassingTest)

let someVar     = 5
class TestScopeIsolate extends SpiderIsolate{
    val
    constructor(){
        super()
        this.val = someVar
    }
}
class TestScopeActor extends Actor{
    TestIsolate
    constructor(){
        super()
        let scope = new LexScope()
        scope.addElement("someVar",someVar)
        bundleScope(TestScopeIsolate,scope)
        this.TestIsolate = TestScopeIsolate
    }
    test(){
        let isol = new this.TestIsolate()
        return isol.val
    }
}
var performScopeBunlde = () => {
    return (app.spawnActor(TestScopeActor) as FarRef<any>).test().then((v)=>{
        log("Scope Bundling",v,someVar)
    })
}
scheduled.push(performScopeBunlde)

class SuperInitActor extends Actor{
    val
    constructor(){
        super()
        this.val = 10
    }
    init(){
        this.val += 5
    }
}
class BaseInitActor extends SuperInitActor{
    init(){
        this.val = this.val * 2
    }
}
var performInitChaining = () =>{
    var a : FarRef<any> = app.spawnActor(BaseInitActor)
    return a.val.then((v)=>{
        log("Init chaining",v,30)
    })
}
scheduled.push(performInitChaining)



function performAll(nextTest){
    nextTest().then(() => {
        if(scheduled.length > 0) {
            performAll(scheduled.pop())
        }
    })
}
performAll(scheduled.pop())


