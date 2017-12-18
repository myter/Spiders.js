import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require("../src/spiders")

let app = new spiders.Application()
class TestActor extends spiders.Actor{
    directory
    constructor(){
        super()
        this.directory = __dirname
    }

    send(toRef){
        var so = require(this.directory+"/../src/MOP/MOP").SpiderObject
        let x = new so()
        x.test
        toRef.getObjectRef(x)
    }
}

class TestActor2 extends spiders.Actor{
    getObjectRef(r){
        console.log(r.test)
    }
}

let a2 = app.spawnActor(TestActor2)
let a = app.spawnActor(TestActor)
a.send(a2)