import {SpiderLib} from "../src/spiders";
import {RepliqCountField, RepliqField, LWR, Count} from "../src/Replication/RepliqField";
import {FieldUpdate} from "../src/Replication/Round";
import {atomic} from "../src/Replication/Repliq";
var spiders : SpiderLib = require("../src/spiders")

class TestRepliq extends spiders.Repliq{
    @Count
    foo
    @LWR
    bar
    constructor(){
        super()
        this.foo = 1
        this.bar = 5
    }

    @spiders.atomic
    setFoo(val){
        this.foo = val
    }

    setBar(val){
        this.bar = val
    }
}

var app = new spiders.Application()
function foo(){

}
class TestActor extends spiders.Actor{
    TestRepliq
    constructor(){
        super()
        this.TestRepliq = TestRepliq
    }

    init(){
        this.newRepliq(this.TestRepliq)
    }
}

app.spawnActor(TestActor)