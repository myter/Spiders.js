import {SpiderLib} from "../src/spiders";
import {CAPActor} from "../src/Onward/CAPActor";
import {Eventual} from "../src/Onward/Eventual";


var spiders : SpiderLib = require("../src/spiders")

export class TestEventual extends Eventual{
    value

    constructor(){
        super()
        this.value = 0
    }

    inc(){
        this.value++
    }

    dec(){
        this.value--
    }
}

class Master extends CAPActor{
    TestEventual
    ev
    constructor(){
        super()
        this.ev = new TestEventual()
    }

    sendAndInc(toRef){
        toRef.getEv(this.ev)
        this.ev.inc()
    }
}
class Slave extends CAPActor{
    ev
    getEv(anEv){
        this.ev = anEv
    }
    test(){
        return new Promise((resolve)=>{
            setTimeout(()=>{
                resolve(this.ev.value)
            },2000)
        })
    }
}
let app = new spiders.Application()
let slave = app.spawnActor(Slave)
let master = app.spawnActor(Master)
master.sendAndInc(slave)
slave.test().then((v)=>{
    console.log("Value = " + v)
})