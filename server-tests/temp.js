/**
 * Created by flo on 10/01/2017.
 */
var spider = require('../src/spiders')
class testApp extends spider.Application { }
class mInnerIsolate extends spider.Isolate{
    constructor(){
        super()
        this.innerField = 10
    }
}
class mIsolate extends spider.Isolate {
    constructor() {
        super();
        this.superField = 6
        this.innerIsol = new mInnerIsolate()
    }
    getInnerIsolate(){
        return innerIsol
    }
}

var app = new testApp();
class testActor extends spider.Actor {
    constructor(){
        super();
        this.mIsolate = new mIsolate();
    }
    getIsolate(){
        return this.mIsolate
    }
}
var actor = app.spawnActor(testActor);
actor.getIsolate().then((isol) => {
    console.log("Got : " + isol.getInnerIsolate().innerField)
})