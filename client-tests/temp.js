/**
 * Created by flo on 19/01/2017.
 */
var spiders = require("../src/spiders")
class testApp extends spiders.Application{

}
var app = new testApp()
class testReqActor extends app.Actor{
    /*constructor(){
     super()
     this.mod = require('/Users/flo/WebstormProjects/Spiders.js/client-tests/clientTestModule')
     }*/
    invoke(){
        console.log(importScripts)
        return this.mod.testFunction()
    }
}
var actor = app.spawnActor(testReqActor)
actor.invoke().then((v) => {
    log("Require: " + (v == 5))
    app.kill()
})
