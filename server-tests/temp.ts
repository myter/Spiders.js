import {SpiderLib} from "../src/spiders";
import {RepliqCountField, RepliqField} from "../src/Replication/RepliqField";
import {FieldUpdate} from "../src/Replication/Round";
var spiders : SpiderLib = require("../src/spiders")

class TestField extends RepliqField<any>{
    update(updates : Array<FieldUpdate>){
        console.log("Updates received : " + updates.length)
        this.triggerTentative()
    }
}
class TestRepliq extends spiders.Repliq{
    reg : RepliqCountField
    t   : any

    constructor(){
        super()
        this.reg = new RepliqCountField("reg",1)
        this.t = new TestField("t",0)
    }

    setReg(val){
        this.reg = val
    }

    @spiders.atomic
    updateT(){
        this.t = 5
        this.t = 6
        this.t = 7
    }
}

class TestApp extends spiders.Application{
    testRepliq

    createAndSend(actRef){
        this.testRepliq = this.newRepliq(TestRepliq)
        this.testRepliq.reg.onCommit((commitedValue)=>{
            console.log("On commit triggered for reg with value : " + commitedValue)
        })
        actRef.getRepliq(this.testRepliq)
    }
}
var app = new TestApp()
class TestActor extends spiders.Actor{
    someVal
    constructor(){
        super()
        this.someVal = 1
    }
    myRepliq
    getRepliq(repliq){
        this.myRepliq = repliq
        var that = this
        this.myRepliq.setReg("It worked !").onceCommited(()=>{
            console.log("Set reg was commited!! : " + that.someVal)
            that.someVal += 1
        })
        this.myRepliq.t.onTentative((tent)=>{
            console.log("On tentative called for replica with val: " + tent)
        })
    }
    testAtomicUpdate(){
        this.myRepliq.updateT()
    }
}

var act = app.spawnActor(TestActor)
app.createAndSend(act)
console.log("Value in app: " + app.testRepliq.reg)
setTimeout(()=>{
    console.log("Value in app: " + app.testRepliq.reg)
    setTimeout(()=>{
        act.testAtomicUpdate()
    },1000)
},4000)