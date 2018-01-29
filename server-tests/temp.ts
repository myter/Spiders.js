import {SpiderLib} from "../src/spiders";
import {CAPActor} from "../src/Onward/CAPActor";
import {Eventual} from "../src/Onward/Eventual";
import {Consistent} from "../src/Onward/Consistent";
import {Available} from "../src/Onward/Available";
import {LexScope} from "../src/utils";


var spiders : SpiderLib = require("../src/spiders")

class TestAvailable extends Available{
    someVal
    constructor(){
        super()
        this.someVal = 5
    }
}

class Act extends spiders.Actor{
    TestAvailable
    av
    thisDir
    constructor(){
        super()
        this.thisDir = __dirname
        console.log("before")
        console.log(Available[LexScope._LEX_SCOPE_KEY_])
        this.av             = new TestAvailable()
        console.log("after")
        console.log(Available[LexScope._LEX_SCOPE_KEY_])
        this.TestAvailable  = TestAvailable
    }

    test(){
        /*let TestAvailable = require(this.thisDir + "/test").TestAvailable
        console.log("before")
        console.log(TestAvailable[LexScope._LEX_SCOPE_KEY_])
        console.log(TestAvailable[LexScope._LEX_SCOPE_KEY_].scopeObjects.get("AvailableMirror"))
        let av = new TestAvailable()
        console.log("after")
        console.log(TestAvailable[LexScope._LEX_SCOPE_KEY_])
        console.log(TestAvailable[LexScope._LEX_SCOPE_KEY_].scopeObjects.get("AvailableMirror"))
        return av.someVal*/
        let av = new this.TestAvailable()
        return av.someVal
    }
}
let app = new spiders.Application()
app.spawnActor(Act).test().then((v)=>{
    console.log("Got back:  " + v)
})

