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
Run the example with:
```javascript
node examples/HelloWorld.js
```
## Same API, client or server
Spiders.js provides the same API whether the application is running on a server or in a browser.
client-side actors are implemented using web workers, while server-side actors run atop child processes.
Moreover, Spiders.js is browserifiable !
## Built-in distribution
All spiders.js actors communicate by asynchronously invoking methods on each other. This communication scheme extends to actors residing on different machines. As an example of how you can implement distributed application using Spiders.js consider the following distributed ping/pong example.
The application's server simply allows the ping and pong clients to register themselves. It provides two methods ```registerPing``` and ```registerPong``` to this end. Each of these methods is invoked by a client which provides a reference to itself.
```javascript
var spider = require('spiders.js')
class Server extends spider.Application{

    constructor(){
        super()
        this.pingerRef
        this.hasPing = false
        this.pongerRef
        this.hasPong = false
    }

    registerPing(pingerRef){
        this.pingerRef  = pingerRef
        this.hasPing    = true
        if(this.hasPong){
            this.pingerRef.meet(this.pongerRef)
            this.pongerRef.meet(this.pingerRef)
        }
    }

    registerPong(pongerRef){
        this.pongerRef  = pongerRef
        this.hasPong    = true
        if(this.hasPing){
            this.pongerRef.meet(this.pingerRef)
            this.pingerRef.meet(this.pongerRef)
        }
    }
}

new Server("127.0.0.1",8000)
```
The client first needs to invoke the appropriate register method on the server. It acquires a reference to the server through the ```remote``` method, which takes the server's address and port number as arguments and returns a promise which resolves with a reference to the server. Subsequently the client registers itself and awaits for the server to introduce it to its peer (i.e. via the ```meet``` method).
```javascript
var spider = require('spiders.js')
class Pinger extends spider.Application{
    constructor(){
        super()
        this.remote("127.0.0.1",8000).then((serverRef)=>{
            serverRef.registerPing(this)
        })
    }
    meet(pongerRef){
        pongerRef.ping()
    }

    pong(){
        document.getElementById("text").value = "Received Pong!"
    }
}
new Pinger()
```
Run the example by starting the server:
```javascript
node examples/Distributed/server.js
```
and opening both ```ping.html``` and ```pong.html``` pages.
