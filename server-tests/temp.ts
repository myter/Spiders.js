import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require("../src/spiders")

class TestMirror extends spiders.SpiderObjectMirror{
    testValue
    invoke(methodName,args){
        console.log("Invoke captured")
        this.testValue = 5
        return super.invoke(methodName,args)
    }
}
class TestObject extends spiders.SpiderObject{
    constructor(mirrorClass){
        super(new mirrorClass())
    }

    someMethod(){
        console.log("Some method called")
        return 5
    }
}
class TestActor extends spiders.Actor{
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
        console.log("mirror val:" + (this.reflectOnObject(o) as TestMirror).testValue )
        console.log("Result: " + r)
        return (this.reflectOnObject(o) as TestMirror).testValue + r
    }
}
let app = new spiders.Application()
let act = app.spawnActor(TestActor)
act.test().then((v)=>{
    console.log("Got result: " + v)
})
