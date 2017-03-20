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

class TestApp extends spiders.Application{
    repliq
    constructor(){
        super()
        this.repliq = this.newRepliq(TestRepliq)
    }
}

var app = new TestApp()
class TestActor extends spiders.Actor{
    myReplica
    getRepliq(replica){
        this.myReplica = replica
    }
    update(val){
        this.myReplica.setFoo(val)
    }

    updateBar(val){
        this.myReplica.setBar(val)
    }
}
var act = app.spawnActor(TestActor)
act.getRepliq(app.repliq)
console.log("Foo Value before : " + app.repliq.foo)
setTimeout(()=>{
    act.update(10)
    setTimeout(()=>{
        console.log("Foo Value after: " + app.repliq.foo)
    },2000)
},1000)
console.log("Bar Value before : " + app.repliq.bar)
setTimeout(()=>{
    act.updateBar(10)
    setTimeout(()=>{
        console.log("Bar Value after: " + app.repliq.bar)
    },2000)
},1000)