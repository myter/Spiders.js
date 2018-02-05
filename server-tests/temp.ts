import {Actor, Application, FarRef} from "../src/spiders";
//var spiders = require('spiders.js')
class TestApplication extends Application{

}

class TestActor extends Actor{
    init(){
        console.log("Actor has been initialised!!")
    }
}
let app = new Application()
app.spawnActor(TestActor)
