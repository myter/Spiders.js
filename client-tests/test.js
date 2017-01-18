/**
 * Created by flo on 18/01/2017.
 */
var spiders = require("../src/spiders")
class testApp extends spiders.Application{
    getGUIField(){
        return window.guiField
    }
}
var app = new testApp()
class testActor extends app.Actor{
    init(){
        parent.getGUIField().then((v) => {
            console.log("Gui field = " + v)
        })
    }
}
var actor = app.spawnActor(testActor)
