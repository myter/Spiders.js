/**
 * Created by flo on 06/03/2017.
 */
var spiders = require("../src/spiders")
class HelloWorldApp extends spiders.Application{
    hello(message){
        console.log("Hello " + message)
    }
}

class  HelloWorldActor extends spiders.Actor{
    world(){
        this.parent.hello("world")
    }
}

var app = new HelloWorldApp()
var actorRef = app.spawnActor(HelloWorldActor)
actorRef.world()