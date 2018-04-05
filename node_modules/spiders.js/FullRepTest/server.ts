import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require("../src/spiders")

class TestRepliq extends spiders.Repliq{
    @spiders.Count
    val

    constructor(){
        super()
        this.val = 1
    }

    inc(){
        this.val  = this.val.read() + 1
    }
}

class Server extends spiders.Application{
    clients
    repliq
    rep
    constructor(){
        super("127.0.0.1",8888)
        this.clients = []
        this.repliq = this.newRepliq(TestRepliq)
        console.log("Server running")
        //this.update(0)
    }

    newClient(clientRef){
        this.clients.push(clientRef)
        if(this.rep != null){
            clientRef.getRepliq(this.rep)
        }
    }

    pushReplica(rep){
        this.rep = rep
        this.clients.forEach((client)=>{
            client.getRepliq(rep)
        })
    }

    masterDone(){
        this.clients.forEach((client)=> {
            client.masterDone()
        })
    }

    update(updated){
        if(updated < 20){
            setTimeout(()=>{
                    this.repliq.inc()
                    this.update(++updated)
            },2000)
        }
        else{
            console.log("Final server value: " + this.repliq.val)
        }
    }
}
new Server()