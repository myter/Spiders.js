import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require("../src/spiders")

class TestIsolate extends spiders.SpiderIsolate{
    field
    constructor(){
        super()
        this.field = 5
    }
}

class TestActor extends spiders.Actor{
    TestIsolate
    constructor(){
        super()
        this.TestIsolate = TestIsolate
    }

    getIsolate(){
        return new this.TestIsolate()
    }
}
let app = new spiders.Application()
let act = app.spawnActor(TestActor)
act.getIsolate().then((isol)=>{
    console.log("Got isol")
    console.log(isol.field)
})
