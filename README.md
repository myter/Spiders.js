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
Actors allow you to deal with parallelism without the hassles of data races and shared mutable state.
An actor is basically a thread running in complete isolation which communicates with other actors via message passing.
Communicating event loops are a special flavour of actors which add object-oriented constructs to this parallel model.
## Spiders.js basics
Any Spiders.js app must create an instance of the ```application``` class.
This instance will serve as an actor factory and as a broker between your parallel code and the "outside" world (e.g. the DOM).
```javascript
var spiders = require('spiders.js')
class HelloWorldApp extends spiders.Application{
  hello(message){
    console.log("Hello " + message)
  }
}
var app = new HelloWorldApp()
```
Actors are defined by extending the ```actor``` class and are spawned by providing their class to the ```spawnActor```method of the ```Application``` instance. The method returns a reference to the actor which allows you to asynchronously invoke its methods.
Each actor has a ```parent``` reference which points to its spawner.
```javascript
class HelloWorldActor extends spiders.Actor{
  world(){
    this.parent.hello("world")
  }
}
var actorRef = app.spanwnActor(HelloWorldActor)
actorRef.world()
```
## Parallel Example
```javascript
var spiders = require('spiders.js')
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
