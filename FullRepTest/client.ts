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

class TestApp extends spiders.Application{
    masterRep
    slaveRep
    server

    constructor(){
        super()
        this.remote("127.0.0.1",8888).then((serverRef)=>{
            this.server = serverRef
            console.log("Connected to server")
            //serverRef.newClient(this)
            if(window["isFirst"]){
                this.masterRep = this.newRepliq(TestRepliq)
                this.masterRep.val.onCommit(()=>{
                    console.log("New value on master: " + this.masterRep.val)
                })
                serverRef.pushReplica(this.masterRep)
                this.update(5)
            }
            else{
                serverRef.newClient(this)
            }
        })
    }

    getRepliq(repliq){
        this.slaveRep = repliq
        console.log("Got repliq. init val: " + repliq.val)
        repliq.val.onCommit(()=>{
            console.log("New value for repliq: " + repliq.val)
        })
    }

    masterDone(){
        this.slaveRep.inc()
    }

    update(count){
        if(count > 0){
            setTimeout(()=>{
                this.masterRep.inc()
                this.update(--count)
            },2000)
        }
        else{
            this.server.masterDone()
        }
    }
}
new TestApp()
