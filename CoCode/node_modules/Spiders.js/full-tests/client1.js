/**
 * Created by flo on 20/01/2017.
 */
var spiders = require("../src/spiders")
class Testapp extends spiders.Application{

}
var app = new Testapp()
class ClientActor extends app.Actor{
    constructor(){
        super()
        this.clientTestVal = 5
    }

    init(){
        console.log("Contacting server")
        remote("127.0.0.1",8080).then((serverRef) => {
            console.log("Server contacted")
            this.serverRef = serverRef
            serverRef.register(this).then((succ) => {
                console.log("[TESTING] Connecting ok: " + succ + " [TESTING]")
            })
        })
    }

    printMessage(msg){
        console.log("Client1 received : " + msg)
    }

    newPeer(clientRef){
        clientRef.printMessage("Hello from client 1")
    }
}
app.spawnActor(ClientActor)