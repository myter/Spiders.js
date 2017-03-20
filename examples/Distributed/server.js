/**
 * Created by flo on 20/03/2017.
 */
var spider = require("../../src/spiders")
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