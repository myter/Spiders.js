# Spiders.js
Parallel and Distributed Programming in JavaScript made easy through actors.
# Usage
Install with npm:
  ```
  npm install spiders.js
  ```
Web workers and child processes are basically the only parallel building blocks available to parallelise applications in JavaScript.
Let’s face it, parallel programming is hard and dealing with the web workers or Node.js' child processes API doesn’t make it easier.
Spiders.js offers a comprehensible API based on communicating event loops which allow you to easily spawn actors in parallel.
Moreover, these actors can natively communicate with any other Spiders.js actor (whether these actors reside on the same machine or not).
# Tutorial
## On Actors and Communicating Event Loops
TODO
## Parallel Example
```javascript
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
```
## Distributed Example
TODO
# Typed Spiders
TODO
