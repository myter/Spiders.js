import {SpiderLib} from "../src/spiders";
import {CAPActor} from "../src/Onward/CAPActor";
import {Eventual} from "../src/Onward/Eventual";
import {Consistent} from "../src/Onward/Consistent";
import {Available} from "../src/Onward/Available";


var spiders : SpiderLib = require("../src/spiders")

let app = new spiders.Application()
class TestAvailable extends Available{
    value
    constructor(){
        super()
        this.value = 5
    }

    incWithPrim(num){
        this.value += num
    }

    incWithCon(con){
        this.value += con.value
    }
}

class TestEventual extends Eventual{
    value
    constructor(){
        super()
        this.value = 5
    }
}
class Act extends CAPActor{
    TestConsistent
    TestEventual
    constructor(){
        super()
        this.TestConsistent = TestAvailable
        this.TestEventual   = TestEventual
    }

    test(){
        let c   = new this.TestConsistent()
        let cc  = new this.TestEventual()
        c.incWithCon(cc)
        return c.value
    }
}
app.spawnActor(Act).test().then((v)=>{
    console.log(v)
})

