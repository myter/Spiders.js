/**
 * Created by flo on 06/02/2017.
 */

import {Actor,Application,SpiderIsolate,SpiderIsolateMirror,SpiderObject,SpiderObjectMirror,SpiderActorMirror,LexScope,bundleScope} from "../src/spiders";
/**
 * Created by flo on 10/01/2017.
 */
var assert                      = require('assert')
var chai                        = require('chai')
var expect                      = chai.expect

describe("Behaviour serialisation",() => {
    it("From file",(done)=>{
        var app = new Application()
        var act = app.spawnActorFromFile(__dirname + '/testActorDefinition',"TestActor")
        act.getValue().then((val)=>{
            try{
                expect(val).to.equal(5)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Field serialisation",function(done){
        this.timeout(3000)
        var app = new Application()
        class testActor extends Actor{
            val
            constructor(){
                super()
                this.val = 10
            }
        }
        var actor = app.spawnActor(testActor)
        actor.val.then((v) => {
            try{
                expect(v).to.equal(10)
                app.kill()
                done()

            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Method serialisation",(done) => {
        var app = new Application()
        class testActor extends Actor{
            msub(){
                return 5
            }
            m(){
                return this.msub() + 5
            }
        }
        var actor = app.spawnActor(testActor)
        actor.m().then((v) => {
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }

        })
    })
    it("Construction",(done) => {
        var app = new Application()
        var aValue = 5
        class testActor extends Actor{
            val
            constructor(){
                super()
                this.val = aValue
            }
            test(){
                return this.val
            }
        }
        var actor = app.spawnActor(testActor)
        actor.test().then((v) => {
            try{
                expect(v).to.equal(aValue)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })

    })
    it("Actor reference passing via constructor",(done) => {
        class referencedActor extends Actor {
            getValue() {
                return 5;
            }
        }
        class referencingActor extends Actor {
            ref
            constructor(actorReference) {
                super();
                this.ref = actorReference;
            }
            getValue(){
                return this.ref.getValue().then((v) => { return v; });
            }
        }
        var app = new Application()
        var actor1 = app.spawnActor(referencedActor);
        var actor2 = app.spawnActor(referencingActor, [actor1]);
        actor2.getValue().then((v) => {
            try{
                expect(v).to.equal(5);
                app.kill();
                done()
            }
            catch(e){
                app.kill();
                done(e)
            }
        })
    })
    it("Initialisation",(done) => {
        var app = new Application()
        class testActor extends Actor{
            val
            constructor(){
                super()
                this.val = 10
            }
            init(){
                this.val += 5
            }
        }
        var actor = app.spawnActor(testActor)
        actor.val.then((v) => {
            try {
                expect(v).to.equal(15)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Initialisation chaining",(done)=>{
        var app = new Application()
        class SuperActor extends Actor{
            val
            constructor(){
                super()
                this.val = 10
            }
            init(){
                this.val += 5
            }
        }

        class BaseActor extends SuperActor{
            init(){
                this.val = this.val * 2
            }
        }
        var act = app.spawnActor(BaseActor)
        act.val.then((v)=>{
            try{
                expect(v).to.equal(30)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Actor scope",(done) => {
        class testApp extends Application{

        }
        var app = new testApp()
        class testActor extends Actor{
            get(){
                return (this as any).promisePool
            }
        }
        var actor = app.spawnActor(testActor)
        actor.get().then((v) => {
            try{
                expect(v).to.equal(undefined)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Inheritance (method)",(done) => {
        var app = new Application()
        class baseActor extends Actor{
            test(){
                return 5
            }
        }
        class inhActor extends baseActor{
            testInh(){
                return this.test()
            }
        }
        var actor = app.spawnActor(inhActor)
        actor.testInh().then((v) => {
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
    it("Inheritance (fields)",(done) => {
        var app = new Application()
        class baseActor extends Actor{
            baseField
            constructor(){
                super()
                this.baseField = 5
            }
        }
        class inhActor extends baseActor{

        }
        var actor = app.spawnActor(inhActor)
        actor.baseField.then((v) => {
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

    /*it("Static Fields & methods",(done)=>{
        var app = new Application()
        class StaticActor extends Actor{
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
        var app = new Application()
        class SuperActor extends Actor{
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
        var app = new Application()
        class StaticActor extends Actor{
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

})

describe("Functionality",() => {
    it("Require",(done) => {
        var app = new Application()
        class testActor extends Actor{
            directory
            mod
            constructor(){
                super()
                this.directory = __dirname
            }
            init(){
                this.mod = require(this.directory + '/testModule')
            }
            invoke(){
                return this.mod.testFunction()
            }
        }
        var actor = app.spawnActor(testActor)
        actor.invoke().then((v) => {
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
    it("Remote",(done) => {
        var app = new Application()
        class testActor1 extends Actor{
            getAndAccess(){
                return this.remote("127.0.0.1",8082).then((ref) => {
                    return ref.getVal()
                })
            }
        }
        class testActor2 extends Actor{
            getVal(){
                return 5
            }
        }
        app.spawnActor(testActor2,[],8082)
        var actor  = app.spawnActor(testActor1)
        actor.getAndAccess().then((v) => {
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
    it("Scope Bundling",(done)=>{
        let app         = new Application()
        let someVar     = 5
        class TestIsolate extends SpiderIsolate{
            val
            constructor(){
                super()
                this.val = someVar
            }
        }
        class TestActor extends Actor{
            TestIsolate
            constructor(){
                super()
                let scope = new LexScope()
                scope.addElement("someVar",someVar)
                bundleScope(TestIsolate,scope)
                this.TestIsolate = TestIsolate
            }
            test(){
                let isol = new this.TestIsolate()
                return isol.val
            }
        }
        app.spawnActor(TestActor).test().then((v)=>{
            try{
                expect(v).to.equal(someVar)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
})

describe("Communication",() => {

    it("Accessing actor instance variable",(done) => {
        var app = new Application()
        class testActor extends Actor{
            value
            constructor(){
                super()
                this.value = 10
            }
        }
        var actor = app.spawnActor(testActor)
        actor.value.then((value) => {
            try{
                expect(value).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }

        })
    })
    it("Invoking method on far reference",(done) => {
        var app = new Application()
        class testActor extends Actor{
            m(){
                return 10
            }
        }
        var actor = app.spawnActor(testActor)
        actor.m().then((retVal) => {
            try{
                expect(retVal).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }

        })
    })
    it("Actor accessing main instance variable", (done) => {
        class testApp extends Application{
            mainValue
            constructor(){
                super()
                this.mainValue = 10
            }

            checkValue(val){
                try{
                    expect(val).to.equal(this.mainValue)
                    this.kill()
                    done()
                }
                catch(e){
                    this.kill()
                    done(e)
                }

            }
        }
        var app = new testApp()
        class testActor extends Actor{
            access(){
                this.parent.mainValue.then((value) => {
                    this.parent.checkValue(value)
                })
            }
        }
        var actor = app.spawnActor(testActor)
        actor.access()
    })
    it("Actor invoking main method",(done) => {
        class testApp extends Application{
            m(){
                try{
                    assert(true)
                    this.kill()
                    done()
                }
                catch(e){
                    this.kill()
                    done(e)
                }

            }
        }
        var app = new testApp()
        class testActor extends Actor{
            invoke(){
                this.parent.m()
            }
        }
        var actor = app.spawnActor(testActor)
        actor.invoke()
    })
    it("Promise rejection handling (method invocation)",(done) => {
        var app = new Application()
        class testActor extends Actor{
            m(){
                throw new Error("This is an error")
            }
        }
        var actor = app.spawnActor(testActor)
        actor.m().catch((reason) => {
            try{
                expect(reason.message).to.equal("This is an error")
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Promise pipelining (field access)",(done) => {
        class testApp extends Application{
            field
            constructor(){
                super()
                this.field = 10
            }
        }
        var app = new testApp()
        class testActor extends Actor{
            get(){
                return this.parent.field
            }
        }
        var actor = app.spawnActor(testActor)
        actor.get().then((val) => {
            try{
                expect(val).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Promise pipelining (method invocation)",(done) => {
        class testApp extends Application{
            get(){
                return 10
            }
        }
        var app = new testApp()
        class testActor extends Actor{
            get(){
                return this.parent.get()
            }
        }
        var actor = app.spawnActor(testActor)
        actor.get().then((val) => {
            try{
                expect(val).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Isolate passing",(done) => {
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
        var app = new Application()
        class testActor extends Actor{
            mIsolate
            constructor(){
                super()
                this.mIsolate = mIsolate
            }
            getIsolate(){
                return new this.mIsolate()
            }
        }
        var actor = app.spawnActor(testActor)
        actor.getIsolate().then((isol) => {
            try{
                expect(isol.field).to.equal(6)
                expect(isol.m()).to.equal(5)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Nested isolate passing",(done) => {
        class testApp extends Application { }
        class InnerIsolate extends SpiderIsolate {
            innerField
            constructor(){
                super()
                this.innerField = 5
            }
        }
        class OuterIsolate extends SpiderIsolate {
            outerField
            innerIsol
            constructor() {
                super();
                this.outerField = 6
                this.innerIsol = new InnerIsolate()

            }
            getOuterField(){
                return this.outerField
            }
            getInnerIsolate(){
                return this.innerIsol
            }
        }

        var app = new testApp();
        class testActor extends Actor {
            mIsolate

            constructor(){
                super();
                this.mIsolate = new OuterIsolate();
            }
            getIsolate(){
                return this.mIsolate
            }
        }
        var actor = app.spawnActor(testActor);
        actor.getIsolate().then((isol) => {
            try{
                expect(isol.getOuterField()).to.equal(6)
                expect(isol.getInnerIsolate().innerField).to.equal(5)
                app.kill();
                done()
            }
            catch(e){
                app.kill();
                done(e)
            }
        })
    })
})

describe("General Serialisation",() => {
    it("Correct serialisation of numeric values",(done) => {
        var app = new Application()
        class testActor extends Actor{
            compute(num){
                return num + 5
            }
        }
        var actor = app.spawnActor(testActor)
        actor.compute(5).then((val) => {
            try {
                expect(val).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Correct serialisation of string values",(done) => {
        var app = new Application()
        class testActor extends Actor{
            append(str){
                return str + 5
            }
        }
        var actor = app.spawnActor(testActor)
        actor.append("5").then((val) => {
            try {
                expect(val).to.equal("55")
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Correct serialisation of boolean values",(done) => {
        var app = new Application()
        class testActor extends Actor{
            test(bool){
                if(bool){
                    return "ok"
                }
                else{
                    return "nok"
                }
            }
        }
        var actor = app.spawnActor(testActor)
        actor.test(false).then((val) => {
            try {
                expect(val).to.equal("nok")
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("User-level promise serialisation",(done) => {
        var app = new Application()
        class testActor extends Actor{
            async(){
                return new Promise((resolve,reject) => {
                    setTimeout(() => {
                        resolve(5)
                    },200)
                })
            }
        }
        var actor = app.spawnActor(testActor)
        actor.async().then((val) => {
            try{
                expect(val).to.equal(5)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Method argument serialisation",(done) => {
        var app = new Application()
        class testActor extends Actor{
            m(num,str,bool){
                return [num,str,bool]
            }
        }
        var actor = app.spawnActor(testActor)
        actor.m(1,"1",true).then((retArr) => {
            try{
                expect(retArr[0]).to.equal(1)
                expect(retArr[1]).to.equal("1")
                expect(retArr[2]).to.equal(true)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Lexical object serialisation during construction",(done) => {
        var app = new Application()
        var ob = {
            field : 5
        }
        class testActor extends Actor{
            farRef
            constructor(){
                super()
                this.farRef = ob
            }
            test(){
                return this.farRef.field
            }
        }
        var actor = app.spawnActor(testActor)
        actor.test().then((v) => {
            try{
                expect(v).to.equal(ob.field)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Far Ref serialisation",(done) => {
        var app = new Application()
        class testActor1 extends Actor{
            value
            constructor(){
                super()
                this.value = 666
            }
        }
        class testActor2 extends Actor{
            obtainAndAccess(farRef){
                return farRef.value
            }
        }
        var actor1 = app.spawnActor(testActor1)
        var actor2 = app.spawnActor(testActor2,[],8081)
        actor2.obtainAndAccess(actor1).then((v) => {
            try{
                expect(v).to.equal(666)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Map serialisation",(done)=>{
        var app = new Application()
        class TestActor extends Actor{
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
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
})

describe("Meta Actor Protocol",() => {
    it("Reflecting on Actor",function(done){
        class TestMirror extends SpiderActorMirror{
            testValue
            constructor(){
                super()
                this.testValue = 5
            }
        }
        class TestActor extends Actor{
            constructor(){
                super(new TestMirror())
            }

            test(){
                return (this.reflectOnActor() as TestMirror).testValue
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
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
    it("Custom Init",function(done){
        class TestMirror extends SpiderActorMirror{
            testValue
            initialise(stdLib,appActor,parentRef){
                super.initialise(stdLib,appActor,parentRef)
                this.testValue = 5
            }
        }
        class TestActor extends Actor{
            testValue
            constructor(){
                super(new TestMirror())
            }

            init(){
                this.testValue = 5
            }

            test(){
                return (this.reflectOnActor() as TestMirror).testValue + this.testValue
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Custom Receive Invocation",function(done){
        class TestMirror extends SpiderActorMirror{
            testValue

            receiveInvocation(sender,target,methodName,args,perform){
                this.testValue = 5
                super.receiveInvocation(sender,target,methodName,args,perform)
            }
        }
        class TestActor extends Actor{
            testValue
            constructor(){
                super(new TestMirror())
            }
            test(){
                this.testValue = 5
                return (this.reflectOnActor() as TestMirror).testValue + this.testValue
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Custom Receive Access",function(done){
        class TestMirror extends SpiderActorMirror{
            receiveAccess(sender,target,fieldName,perform){
                target[fieldName]+= 5
                super.receiveAccess(sender,target,fieldName,perform)
            }
        }
        class TestActor extends Actor{
            testValue
            constructor(){
                super(new TestMirror())
                this.testValue = 5
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.testValue.then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Custom Send Invocation",function(done){
        class TestMirror extends SpiderActorMirror{
            testValue
            sendInvocation(target,methodName,args){
                this.testValue = 5
                return super.sendInvocation(target,methodName,args)
            }
        }
        class TestApp extends Application{
            test(){
                return 5
            }
        }
        class TestActor extends Actor{
            constructor(){
                super(new TestMirror())
            }
            test(){
                return this.parent.test().then((v)=>{
                    return (this.reflectOnActor() as TestMirror).testValue + v
                })
            }
        }
        let app = new TestApp()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Custom Send Access",function(done){
        class TestMirror extends SpiderActorMirror{
            testValue
            sendAccess(target,fieldName){
                this.testValue = 5
                return super.sendAccess(target,fieldName)
            }
        }
        class TestApp extends Application{
            testValue
            constructor(){
                super()
                this.testValue = 5
            }
        }
        class TestActor extends Actor{
            constructor(){
                super(new TestMirror())
            }

            test(){
                return this.parent.testValue.then((v)=>{
                    return (this.reflectOnActor() as TestMirror).testValue + v
                })
            }
        }
        let app = new TestApp()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
})

describe("Meta Object Protocol",()=>{
    it("Reflecting on Object",function(done){
        class TestMirror extends SpiderObjectMirror{
            testValue
            constructor(){
                super()
                this.testValue = 5
            }
        }
        class TestObject extends SpiderObject{
            constructor(mirrorClass){
                super(new mirrorClass())
            }
        }
        class TestActor extends Actor{
            TestObject
            TestMirror
            constructor(){
                super()
                this.TestObject = TestObject
                this.TestMirror = TestMirror
            }
            test(){
                let o = new this.TestObject(this.TestMirror)
                return (this.reflectOnObject(o) as TestMirror).testValue
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
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
    it("Custom Invoke",function(done){
        class TestMirror extends SpiderObjectMirror{
            testValue
            invoke(methodName,args){
                this.testValue = 5
                return super.invoke(methodName,args)
            }
        }
        class TestObject extends SpiderObject{
            constructor(mirrorClass){
                super(new mirrorClass())
            }

            someMethod(){
                return 5
            }
        }
        class TestActor extends Actor{
            TestObject
            TestMirror
            constructor(){
                super()
                this.TestObject = TestObject
                this.TestMirror = TestMirror
            }
            test(){
                let o = new this.TestObject(this.TestMirror)
                let r = o.someMethod()
                return (this.reflectOnObject(o) as TestMirror).testValue + r
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Custom Access",function(done){
        class TestMirror extends SpiderObjectMirror{
            testValue

            access(fieldName){
                this.testValue = 5
                return super.access(fieldName)
            }
        }
        class TestObject extends SpiderObject{
            someField
            constructor(mirrorClass){
                super(new mirrorClass())
                this.someField = 5
            }
        }
        class TestActor extends Actor{
            TestObject
            TestMirror
            constructor(){
                super()
                this.TestObject = TestObject
                this.TestMirror = TestMirror
            }
            test(){
                let o = new this.TestObject(this.TestMirror)
                let r = o.someField
                return (this.reflectOnObject(o) as TestMirror).testValue + r
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Custom Write",function(done){
        class TestMirror extends SpiderObjectMirror{
            testValue

            write(fieldName,value){
                this.testValue = 5
                this.base[fieldName] = value * 2
                return true
            }
        }
        class TestObject extends SpiderObject{
            someField
            constructor(mirrorClass){
                super(new mirrorClass())
                this.someField = 5
            }
        }
        class TestActor extends Actor{
            TestObject
            TestMirror
            constructor(){
                super()
                this.TestObject = TestObject
                this.TestMirror = TestMirror
            }
            test(){
                let o = new this.TestObject(this.TestMirror)
                let r = o.someField
                return (this.reflectOnObject(o) as TestMirror).testValue + r
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
            try{
                expect(v).to.equal(15)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })
    it("Custom Pass",function(done){
        class TestMirror extends SpiderIsolateMirror{
            testValue

            pass(){
                this.testValue = 5
                return super.pass()
            }
        }
        class TestObject extends SpiderIsolate{
            constructor(mirrorClass){
                super(new mirrorClass())
            }
        }
        class TestActor extends Actor{
            o
            constructor(){
                super()
                this.o          = new TestObject(TestMirror)
            }
            test(){
                return (this.reflectOnObject(this.o) as TestMirror).testValue
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
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
    it("Custom Resolve",function(done){
        class TestMirror extends SpiderIsolateMirror{
            testValue

            resolve(){
                this.testValue = 5
            }
        }
        class TestObject extends SpiderIsolate{
            constructor(mirrorClass){
                super(new mirrorClass())
            }
        }
        class TestActor extends Actor{
            o
            constructor(){
                super()
                this.o          = new TestObject(TestMirror)
            }
            test(){
                return (this.reflectOnObject(this.o) as TestMirror).testValue
            }
        }
        let app = new Application()
        let act = app.spawnActor(TestActor)
        act.test().then((v)=>{
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
})
