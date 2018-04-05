import {SpiderLib} from "../src/spiders";

var spiders : SpiderLib = require("../src/spiders")

export class TActor extends spiders.Actor{
    receive(){
        let receiveTime = Date.now()
        this.parent.received(receiveTime)
    }
}