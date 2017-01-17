/**
 * Created by flo on 10/01/2017.
 */
var spider = require('../src/spiders')
class myApp extends spider.Application{
    constructor(){
        super()
        this.field = 5
    }
    foo(msg){
      console.log("Actor said : " + msg)
        return 5
    }
}
class myIsolate extends spider.Isolate{
    constructor(){
        this.name = "My Isolate"
    }
    printName(){
        console.log(this.name)
    }
}
var app = new myApp()
class myActor extends app.Actor{
    constructor(){
        super()
        this.myIsolate = myIsolate
    }
    getIsolate(){
        return new this.myIsolate()
    }
}
var actor = app.spawnActor(myActor)
class otherActor extends myActor {

}
actor.getIsolate().then((v) => {
    console.log(v.printName())
})
