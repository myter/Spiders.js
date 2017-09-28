import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require('../src/spiders')

class App extends spiders.Application{
    sendtime
    receiveTime

    send(actorRef){
        this.sendtime = Date.now()
        actorRef.receive()
    }

    received(time){
        this.receiveTime = time
        console.log("Total time taken : " + (this.receiveTime - this.sendtime))
    }
}

class TActor extends spiders.Actor{
    receive(){
        let receiveTime = Date.now()
        this.parent.received(receiveTime)
    }
}


let a = new App()
let act = a.spawnActor(TActor)
a.send(act)