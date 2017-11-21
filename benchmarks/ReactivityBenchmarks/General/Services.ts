import {MicroServiceApp} from "../../../src/MicroService/MicroService";
import {SpiderLib} from "../../../src/spiders";
var spiders : SpiderLib = require("../../../src/spiders")

export var masterId     = 0
export var masterIP     = "127.0.0.1"
export var admitterId   = 1
export var admitterIP   = "127.0.0.1"
export var piIds        = []
for(var i = 2;i < 60;i++){
    piIds.push(i)
}
export var piAddresses = piIds.map((id,index)=>{
    //TODO find out real IP addresses
    return "127.0.0.1"
})

//TEMP
let admitterPort = 8001
let masterPort  = 8000
let base = 8002
export var piPorts      = piIds.map((id,index)=>{
    return base + index
})

export class Admitter extends MicroServiceApp{

}

export class SourceService extends MicroServiceApp{

}

export class CentralService extends MicroServiceApp{

}