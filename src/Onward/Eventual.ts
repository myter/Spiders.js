import {GSP} from "./GSP";
import {SpiderLib} from "../spiders";

var spiders : SpiderLib = require("../spiders")

export class EventualMirror extends spiders.SpiderIsolateMirror{

}

export class Eventual extends spiders.SpiderIsolate{
    hostGsp     : GSP
    id          : string
    isEventual

    constructor(){
        super(new EventualMirror())
        this.id             = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        })
        this.isEventual     = true
    }

    //Called by host actor when this eventual is first passed to other actor
    setHost(hostGsp : GSP){
        this.hostGsp = hostGsp
    }

    resetToCommit(){
        //TODO run over each field and set it back to commited value
    }

    commit(){
        //TODO run over each field and set tentative values to commited values
    }
}