import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require("../src/spiders")

class TestRep extends spiders.Repliq{
    val
    constructor(){
        super()
        this.val = 1
    }

    inc(){
        console.log("Inced")
        this.val = 66
    }
}

class TestApp extends spiders.Application{
    rep
    constructor(){
        super()
        this.rep = this.newRepliq(TestRep)
    }
}

class TestActor extends spiders.Actor{
    rep
    getRep(rep){
        console.log("Got rep")
        this.rep = rep
        rep.val.onCommit(()=>{
            console.log("New rep val: " + rep.val)
        })
    }

    getVal(){
        return this.rep.val.valueOf()
    }
}

let app = new TestApp()
let act = app.spawnActor(TestActor)
act.getRep(app.rep)
app.rep.inc()
setTimeout(()=>{
    act.getVal().then((v)=>{
        console.log("Value = " + v)
    })
},2000)
/*function update(){
    setTimeout(()=>{
        app.rep.inc()
        update()
    },2000)
}
update()*/
