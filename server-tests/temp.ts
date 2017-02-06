import {SpiderLib, FarRef} from "../src/spiders";
/**
 * Created by flo on 25/01/2017.
 */
var spiders : SpiderLib = require("../src/spiders")
var app = new spiders.Application()
class SuperActor extends spiders.Actor{
    test(){
        return 5
    }
}
class Base extends SuperActor{
    test(){
        return (super.test())
    }
}
var a = app.spawnActor(Base)
a.test().then((v)=>{
    console.log("Got : " + v)
})
