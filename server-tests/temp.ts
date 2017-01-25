import {SpiderLib, FarRef} from "../src/spiders";
/**
 * Created by flo on 25/01/2017.
 */
var spider : SpiderLib = require('../src/spiders')
//class testApp extends spider.Application{}
var app = new spider.Application()
class mIsolate extends spider.Isolate{
    perform() : number {
        var x : number = 6
        return 6 + x
    }
}
class testActor extends spider.Actor{
    isol
    constructor(){
        super()
        this.isol = mIsolate
    }

    calc() : number{
        var x : number = 6
        return 5 + x
    }

    getNewIsol() : mIsolate{
        return new this.isol()
    }
}
var actor : FarRef = app.spawnActor(testActor)
actor.getNewIsol().then((iso) => {
    console.log("Got : " + iso.perform())
})