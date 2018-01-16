import {SpiderLib} from "../src/spiders";
import {getSerialiableClassDefinition} from "../src/utils";
import getPrototypeOf = Reflect.getPrototypeOf;

var spiders : SpiderLib = require("../src/spiders")

class TestIsolate extends spiders.SpiderIsolate{
    field
    constructor(){
        super()
        this.field = 5
    }
}
class TestBaseIsolate extends TestIsolate{
    baseField
    constructor(){
        super()
        this.baseField = 6
    }
}

class TestActor extends spiders.Actor{
    TestIsolate
    constructor(){
        super()
        this.TestIsolate = TestBaseIsolate
    }

    init(){
        let isol = new this.TestIsolate()
        console.log(isol.baseField)
        console.log(isol.field)
    }

    getIsolate(){
        return new this.TestIsolate()
        //return this.TestIsolate
    }
}
let app = new spiders.Application()
let act = app.spawnActor(TestActor)
act.getIsolate().then((isol)=>{
    console.log("Got isol")
    console.log(isol.baseField)
    console.log(isol.field)
})
/*act.getIsolate().then((isol)=>{
    console.log("Got isol")
    /*console.log("Got isol")
    console.log(isol.field)
    console.log(isol.baseField)
})*/