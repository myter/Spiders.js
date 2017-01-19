/**
 * Created by flo on 19/01/2017.
 */
var spiders = require("../src/spiders")
class testApp extends spiders.Application{

}
var app = new testApp()
class ac1 extends app.Actor{

}
class ac2 extends app.Actor{

}
var actor1 = app.spawnActor(ac1)
var actor2 = app.spawnActor(ac1)