/**
 * Created by flo on 18/01/2017.
 */
var spiders = require("../src/spiders")
class testApp extends spiders.Application{

}
var app = new testApp()
class testActor extends app.Actor{
    meth(){
        return 5
    }
}
var actor = app.spawnActor(testActor)