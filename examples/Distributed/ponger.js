/**
 * Created by flo on 20/03/2017.
 */
var spider = require("../../src/spiders")
class Ponger extends spider.Application{
    constructor(){
        super()
        this.libs.remote("127.0.0.1",8000).then((serverRef)=>{
            serverRef.registerPong(this)
        })
    }
    meet(pingerRef){
        pingerRef.pong()
    }

    ping(){
        document.getElementById("text").value = "Received Ping!"
    }
}
new Ponger()