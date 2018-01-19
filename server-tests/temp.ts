import {FarRef, SpiderLib} from "../src/spiders";
import {CAPActor} from "../src/Onward/CAPActor";
import {TestEventual} from "./tempEventual";


var spiders : SpiderLib = require("../src/spiders")



/*class Actor1 extends CAPActor{
    thisDirectory
    constructor(){
       super()
        this.thisDirectory = __dirname
    }

    share(withRef){
        let TestEventual = require(this.thisDirectory + "/tempEventual").TestEventual
        let ev = new TestEventual()
        withRef.get(ev)
    }
}

class Actor2 extends CAPActor{
    get(anEv : TestEventual){
        anEv.dec()
    }
}
let app = new spiders.Application()
let act1 = app.spawnActor(Actor1)
let act2 = app.spawnActor(Actor2)
act1.share(act2)*/



class TestActor extends spiders.Actor{
    m
    constructor(){
        super()
        this.m = new Map()
        this.m.set("native",5)
        this.m.set("object",{x:5})
    }

    test(){
        console.log("Map = " + this.m)
        let nat = this.m.get("native")
        return this.m.get("object").x.then((xVal)=>{
                return xVal + nat
            })
    }
}
let app = new spiders.Application()
app.spawnActor(TestActor).test().then((v)=>{
    console.log(v)
})
