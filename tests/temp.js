/**
 * Created by flo on 10/01/2017.
 */
var spider = require('../src/spiders')
class testApp extends spider.Application{
    constructor(){
        super()
        this.field = 5
    }
    foo(){
        console.log("Foo called")
    }
}
var app = new testApp()
class testActor extends app.Actor{
    constructor(fieldVal){
        super()
        this.field = fieldVal
    }
}
var actor = app.spawnActor(testActor,666)
actor.field.then((v) => {
    console.log(v)
})