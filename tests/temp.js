/**
 * Created by flo on 10/01/2017.
 */
var spider = require('../src/spiders')
class testApp extends spider.Application{

}
class mIsolate extends spider.Isolate{
    constructor(){
        this.field = 6
    }
    m(){
        return 5
    }
}
var app = new testApp()
class testActor extends app.Actor{
    constructor(){
        super()
        this.mIsolate = mIsolate
    }
    getIsolate(){
        return new this.mIsolate()
    }
}
var actor = app.spawnActor(testActor)