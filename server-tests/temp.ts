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
        this.av             = new TestAvailable()
        this.TestAvailable  = TestAvailable
    }

    test(){
        let av = new this.TestAvailable()
        //av.someVal = 111
        return av.someVal
    }
}
let app = new spiders.Application()
app.spawnActor(Act).test().then((v)=>{
    console.log("Got back:  " + v)
})

