import {SpiderLib} from "../src/spiders";
import {CAPActor} from "../src/Onward/CAPActor";


var spiders : SpiderLib = require("../src/spiders")



class Actor1 extends CAPActor{
    thisDirectory
    constructor(){
       super()
        this.thisDirectory = __dirname
    }

    init(){
        let TestEventual = require(this.thisDirectory + "/tempEventual").TestEventual
        let ev = new TestEventual()
    }
}

class Actor2 extends CAPActor{

}
let app = new spiders.Application()
let act1 = app.spawnActor(Actor1)
let act2 = app.spawnActor(Actor2)