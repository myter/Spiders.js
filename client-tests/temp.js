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
    }
    invoke(){
        console.log("Mod = " + this.mod.testFunction)
        return this.mod.testFunction()
    }*/
    dummy(){
        console.log("Hello dummy")
        //require('/Users/flo/WebstormProjects/Spiders.js/client-tests/clientTestModule')
    }
}
var actor = app.spawnActor(testReqActor)
actor.dummy()
/*actor.invoke().then((v) => {
    console.log("v =  " + v)
})*/
