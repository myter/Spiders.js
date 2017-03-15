/**
 * Created by flo on 06/03/2017.
 */
var spiders = require('../src/spiders')
class PingPongApp extends spiders.Application{
    constructor(){
        super()
        this.pings = 0
    }
    pingReceived(){
        this.pings += 1
        if(this.pings > 10){
            this.kill()
        }
    }
}
var app = new PingPongApp()
class PingActor extends spiders.Actor{
    start(pongRef){
        pongRef.ping(this)
    }

    pong(pongRef){
        console.log("Pong")
        pongRef.ping(this)
    }
}
class PongActor extends spiders.Actor{
    ping(pingRef){
        console.log("Ping")
        this.parent.pingReceived()
        pingRef.pong(this)
    }
}
var pongRef = app.spawnActor(PongActor)
var pingRef = app.spawnActor(PingActor)
pingRef.start(pongRef)
