import {SpiderLib} from "../src/spiders";
import {CAPActor} from "../src/Onward/CAPActor";


var spiders : SpiderLib = require("../src/spiders")



class Actor1 extends CAPActor{
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
    get(anEv){

    }
}
let app = new spiders.Application()
let act1 = app.spawnActor(Actor1)
let act2 = app.spawnActor(Actor2)
act1.share(act2)