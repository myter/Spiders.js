/**
 * Created by flo on 10/01/2017.
 */
var spider = require('../src/spiders')
class testApp extends spider.Application {
}
var app = new testApp()
class testActor extends app.Actor{
    constructor(){
        super()
        this.field = 666
    }
    print(){
        console.log("Working now")
        return 5
    }
}
var actor = app.spawnActor(testActor)
actor.field.then((v) => {
    console.log("Got : " + v)
})