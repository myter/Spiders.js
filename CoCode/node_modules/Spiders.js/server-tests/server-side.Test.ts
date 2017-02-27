/**
 * Created by flo on 06/02/2017.
 */
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_chai_index.d.ts"/>
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_mocha_index.d.ts"/>

import {SpiderLib} from "../src/spiders";
import Base = Mocha.reporters.Base;
/**
 * Created by flo on 10/01/2017.
 */
var assert                      = require('assert')
var chai                        = require('chai')
var expect                      = chai.expect
var spider  : SpiderLib         = require('../src/spiders')
var serialisation               = require('../src/serialisation')

describe("Behaviour serialisation",() => {

    it("Field serialisation",function(done){
        this.timeout(3000)
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        var aValue = 5
        class testActor extends spider.Actor{
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
        class referencedActor extends spider.Actor {
            getValue() {
                return 5;
            }
        }
        class referencingActor extends spider.Actor {
            ref
            constructor(actorReference) {
                super();
                this.ref = actorReference;
            }
            getValue(){
                return this.ref.getValue().then((v) => { return v; });
            }
        }
        var app = new spider.Application()
        var actor1 = app.spawnActor(referencedActor);
        var actor2 = app.spawnActor(referencingActor, [actor1], 8081);
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
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class SuperActor extends spider.Actor{
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
        class testApp extends spider.Application{

        }
        var app = new testApp()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class baseActor extends spider.Actor{
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
        var app = new spider.Application()
        class baseActor extends spider.Actor{
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

    it("Static Fields & methods",(done)=>{
        var app = new spider.Application()
        class StaticActor extends spider.Actor{
            static _STATIC_FIELD_ = 5
            static _STATIC_METHOD_(){
                return 6
            }
            getField(){
                return StaticActor._STATIC_FIELD_
            }
            getMethod(){
                return StaticActor._STATIC_METHOD_()
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

    })

})

describe("Functionality",() => {
    it("Require",(done) => {
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class testActor1 extends spider.Actor{
            getAndAccess(){
                return this.remote("127.0.0.1",8082).then((ref) => {
                    return ref.getVal()
                })
            }
        }
        class testActor2 extends spider.Actor{
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
})


describe("Communication",() => {

    it("Accessing actor instance variable",(done) => {
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        class testApp extends spider.Application{
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
        class testActor extends spider.Actor{
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
        class testApp extends spider.Application{
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
        class testActor extends spider.Actor{
            invoke(){
                this.parent.m()
            }
        }
        var actor = app.spawnActor(testActor)
        actor.invoke()
    })

    it("Promise rejection handling (method invocation)",(done) => {
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        class testApp extends spider.Application{
            field
            constructor(){
                super()
                this.field = 10
            }
        }
        var app = new testApp()
        class testActor extends spider.Actor{
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
        class testApp extends spider.Application{
            get(){
                return 10
            }
        }
        var app = new testApp()
        class testActor extends spider.Actor{
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
        class mIsolate extends spider.Isolate{
            field
            constructor(){
                super()
                this.field = 6
            }
            m(){
                return 5
            }
        }
        var app = new spider.Application()
        class testActor extends spider.Actor{
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

    it("Array Isolate passing",(done)=>{
        var app = new spider.Application()
        class testActor1 extends spider.Actor{
            getArrayLength(arr){
                return arr.length
            }
        }
        class testActor2 extends spider.Actor{
            sendArray(ref){
                return ref.getArrayLength(new this.ArrayIsolate([1,2,3,4,5]))
            }
        }
        var actor1 = app.spawnActor(testActor1)
        var actor2 = app.spawnActor(testActor2,[],8082)
        actor2.sendArray(actor1).then((val)=>{
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

    it("Nested isolate passing",(done) => {
        class testApp extends spider.Application { }
        class innerIsolate extends spider.Isolate {
            innerField
            constructor(){
                super()
                this.innerField = 5
            }
        }
        class outerIsolate extends spider.Isolate {
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
        class testActor extends spider.Actor {
            mIsolate
            constructor(){
                super();
                this.mIsolate = new outerIsolate();
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
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        var ob = {
            field : 5
        }
        class testActor extends spider.Actor{
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
        var app = new spider.Application()
        class testActor1 extends spider.Actor{
            value
            constructor(){
                super()
                this.value = 666
            }
        }
        class testActor2 extends spider.Actor{
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
})
