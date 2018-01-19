import {FarRef, SpiderLib} from "../src/spiders";
import {CAPActor} from "../src/Onward/CAPActor";
import {TestEventual} from "./tempEventual";


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
        ev.commit()
        withRef.get(ev)
        ev.commit()
    }
}

class Actor2 extends CAPActor{
    get(anEv : TestEventual){
        //anEv.dec()
    }
}
let app = new spiders.Application()
let act1 = app.spawnActor(Actor1)
let act2 = app.spawnActor(Actor2)
act1.share(act2)

/*class TestMirror extends spiders.SpiderActorMirror{
    receiveInvocation(sender : FarRef,targetObject : Object,methodName : string,args : Array<any>,performInvocation : () => void = () => {}){
        let isol = args[0]
        isol.setO({x:6})
        return super.receiveInvocation(sender,targetObject,methodName,args,performInvocation)
    }
}

class Actor1 extends spiders.Actor{
    direct
    constructor(){
        super()
        this.direct = __dirname
    }

    sendTo(ref){
        let TestIsolate = require(this.direct + "/tempEventual").TestIsolate
        let isol = new TestIsolate(5,{x:5})
        ref.get(isol)
    }
}
class Actor2 extends spiders.Actor{
    constructor(){
        super(new TestMirror())
    }
    get(isol){
        isol.doSomething()
    }
}
let app = new spiders.Application()
let ac1 = app.spawnActor(Actor1)
let ac2 = app.spawnActor(Actor2)
ac1.sendTo(ac2)*/
