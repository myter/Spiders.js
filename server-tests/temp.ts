import {SpiderLib} from "../src/spiders";
import {RepliqCountField} from "../src/Replication/RepliqField";
var spiders : SpiderLib = require("../src/spiders")
class TestRepliq extends spiders.Repliq{
    reg : RepliqCountField

    constructor(){
        super()
        this.reg = new RepliqCountField("reg",1)
    }

    setReg(val){
        this.reg = val
    }
}

class TestApp extends spiders.Application{
    testRepliq

    createAndSend(actRef){
        this.testRepliq = this.newRepliq(TestRepliq)
        actRef.getRepliq(this.testRepliq)
    }
}
var app = new TestApp()
class TestActor extends spiders.Actor{
    myRepliq
    getRepliq(repliq){
        this.myRepliq = repliq
        this.myRepliq.setReg("It worked !")
    }
}

var act = app.spawnActor(TestActor)
app.createAndSend(act)
console.log("Value in app: " + app.testRepliq.reg)
setTimeout(()=>{
    console.log("Value in app: " + app.testRepliq.reg)
},4000)