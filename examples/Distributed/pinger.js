/**
 * Created by flo on 20/03/2017.
 */
var spider = require("../../src/spiders")
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