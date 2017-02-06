import {SpiderLib, FarRef} from "../src/spiders";
/**
 * Created by flo on 25/01/2017.
 */
var spiders : SpiderLib = require("../src/spiders")
var app = new spiders.Application()
class SuperActor extends spiders.Actor{
    static STATFIELD = 5
    static statM(){
        return 6
    }
    regular(){
        console.log("Regular method called")
    }
    testField(){
        return SuperActor.STATFIELD
    }
    testMethod(){
        return SuperActor.statM()
    }
}
class BaseActor extends SuperActor{
    static BASESTATFIELD = 55
    testBaseField(){
        console.log("Base field invoked")
        return BaseActor.BASESTATFIELD = 5
    }
    testSuperField(){
        return SuperActor.STATFIELD
    }
}
var act = app.spawnActor(BaseActor)
act.testBaseField().then((v)=>{
    console.log("Static base field in promise : " + v)
})
act.testSuperField().then((v)=>{
    console.log("Static super field in promise :" + v)
})