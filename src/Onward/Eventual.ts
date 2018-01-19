import {GSP} from "./GSP";
import {SpiderLib} from "../spiders";

var spiders : SpiderLib = require("../spiders")

export class EventualMirror extends spiders.SpiderIsolateMirror{
    private ignoreInvoc(methodName){
        return methodName == "setHost" || methodName == "resetToCommit" || methodName == "commit"
    }

    invoke(methodName,args){
        if(!this.ignoreInvoc(methodName)){
            let baseEV = (this.base as Eventual);
            baseEV.hostGsp.createRound(baseEV.id,baseEV.ownerId,methodName,args)
            let ret = super.invoke(methodName,args)
            baseEV.hostGsp.yield(baseEV.id,baseEV.ownerId)
            return ret
        }
        else{
            if(methodName == "commit"){
                console.log("Invoking(Mirror): " + methodName)
                console.log(this.base as Eventual == undefined)
            }
            return super.invoke(methodName,args)
        }
    }
}

export class Eventual extends spiders.SpiderIsolate{
    hostGsp     : GSP
    hostId      : string
    ownerId     : string
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
    setHost(hostGsp : GSP,hostId : string = undefined,isOwner : boolean){
        this.hostGsp    = hostGsp
        this.hostId     = hostId
        if(isOwner){
            this.ownerId = hostId
        }
    }

    resetToCommit(){
        //TODO run over each field and set it back to commited value
        console.log("Resetting to commit !")
    }

    commit(){
        //TODO run over each field and set tentative values to commited values
        console.log("Commit called")
    }
}