/**
 * Created by flo on 20/01/2017.
 */
var spiders = require("../src/spiders")
class testApp extends spiders.Application{

}
var app = new testApp()
class ServerActor1 extends app.Actor{
    constructor(){
        super()
        this.clients = []
        this.first = true
    }

    register(clientRef){
        this.clients.push(clientRef)
        this.clients.forEach((i) => {
            this.clients.forEach((j) => {
                if(i != j){
                    i.newPeer(j)
                }
            })
        })
        if(this.first){
            clientRef.clientTestVal.then((val) => {
                console.log("[TESTING] Client test val : " + val +  " [TESTING]")
            })
            remote("127.0.0.1",8081).then((serverRef) => {
                serverRef.passClient(clientRef)
            })
        }
        this.first = false
        return true
    }
}
class ServerActor2 extends app.Actor{
    passClient(clientRef){
        clientRef.clientTestVal.then((val) => {
            console.log("[TESTING] Routing : " + val + " [TESTING]")
        })
    }
}
app.spawnActor(ServerActor1,[],8080)
app.spawnActor(ServerActor2,[],8081)