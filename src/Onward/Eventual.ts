import {GSP} from "./GSP";
import {SpiderLib} from "../spiders";
import {bundleScope, LexScope} from "../utils";

var spiders : SpiderLib = require("../spiders")

export class EventualMirror extends spiders.SpiderIsolateMirror{
    private ignoreInvoc(methodName){
        return methodName == "setHost" || methodName == "resetToCommit" || methodName == "commit" || methodName == "populateCommitted"
    }

    invoke(methodName,args){
        let baseEV = this.base as Eventual
        if(!baseEV.hostGsp){
            return super.invoke(methodName,args)
        }
        else if(!this.ignoreInvoc(methodName)){
            if((baseEV.hostGsp.replay as any).includes(baseEV.id)){
                return super.invoke(methodName,args)
            }
            else{
                baseEV.hostGsp.createRound(baseEV.id,baseEV.ownerId,methodName,args)
                let ret = super.invoke(methodName,args)
                baseEV.hostGsp.yield(baseEV.id,baseEV.ownerId)
                return ret
            }

        }
        else{
            return super.invoke(methodName,args)
        }
    }
}

export class Eventual extends spiders.SpiderIsolate{
    hostGsp             : GSP
    hostId              : string
    ownerId             : string
    id                  : string
    committedVals       : Map<string,any>
    isEventual

    //Calling this at construction time is dangerous but ok for now. A problem could arise if an eventual is created and serialised at actor construction-time (some elements in the map might be serialised as far references)
    populateCommitted(){
        Reflect.ownKeys(this).forEach((key)=>{
            if(key != "hostGSP" && key != "hostId" && key != "ownerId" && key != "id" && key != "committedVals" && key != "isEventual" && key != "_INSTANCEOF_ISOLATE_"){
                this.committedVals.set(key.toString(),this[key])
            }
        })
    }

    constructor(){
        super(new EventualMirror())
        this.id             = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        })
        this.isEventual     = true
        this.committedVals   = new Map()
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
        this.committedVals.forEach((committedVal,key)=>{
            this[key] = committedVal
        })
    }

    commit(){
        this.committedVals.forEach((_,key)=>{
            this.committedVals.set(key,this[key])
        })
    }
}
let evScope = new LexScope()
evScope.addElement("EventualMirror",EventualMirror)
bundleScope(Eventual,evScope)