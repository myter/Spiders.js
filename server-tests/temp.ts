import {SpiderLib} from "../src/spiders";
import {CAPActor} from "../src/Onward/CAPActor";
import {Eventual} from "../src/Onward/Eventual";
import {bundleScope, LexScope} from "../src/utils";


var spiders : SpiderLib = require("../src/spiders")


var someVar = 5
class TestIsol extends spiders.SpiderIsolate {
    getFromScope(){
        return someVar
    }
}


class TestActor extends spiders.Actor{
    Class
    constructor(){
        super()
        let scope = new LexScope()
        scope.addElement("someVar",someVar)
        bundleScope(TestIsol,scope)
        this.Class = TestIsol
    }

    init(){
        let i = new this.Class()
        console.log(i.getFromScope())
    }
}
let app = new spiders.Application()
app.spawnActor(TestActor)


/*export class TestEventual extends Eventual{
    value

    constructor(){
        super()
        this.value = 0
    }

    inc(){
        this.value++
    }

    dec(){
        this.value--
    }
}

class Actor1 extends CAPActor{
    TestEventual
    te
    constructor(){
        super()
        this.TestEventual = TestEventual
        //this.te = new TestEventual()
    }

    share(withRef){
        let ev = new this.TestEventual()
        //let ev = this.te
        withRef.get(ev)
        setTimeout(()=>{
            console.log(ev.value)
        },2000)
    }
}

class Actor2 extends CAPActor{
    get(anEv : TestEventual){
        anEv.inc()
        setTimeout(()=>{
            console.log(anEv.value)
        },2000)
    }
}
let app = new spiders.Application()
let act1 = app.spawnActor(Actor1)
let act2 = app.spawnActor(Actor2)
act1.share(act2)*/

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
        setTimeout(()=>{
            console.log(ev.value)
        },2000)
    }
}

class Actor2 extends CAPActor{
    get(anEv : TestEventual){
        anEv.dec()
        setTimeout(()=>{
            console.log(anEv.value)
        },2000)
    }
}
let app = new spiders.Application()
let act1 = app.spawnActor(Actor1)
let act2 = app.spawnActor(Actor2)
act1.share(act2)*/
