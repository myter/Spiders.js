import {MicroService} from "../src/MicroService/MicroService";
import {SpiderLib} from "../src/spiders";
var spiders : SpiderLib = require("../src/spiders")

export class ConfigSignal extends spiders.Signal{
    type

    constructor(){
        super()
        this.type = "short"
    }

    @spiders.mutator
    change(){
        this.type = "long"
    }
}

export class ConfigService extends MicroService{
    ConfigSignal

    constructor(){
        super()
        this.ConfigSignal = ConfigSignal
    }

    start(){
        let sig = this.newSignal(this.ConfigSignal)
        this.publishSignal(sig)
        setTimeout(()=>{
            sig.change()
        },15000)
    }
}