import {GSP} from "./GSP";
import {SpiderLib} from "../spiders";
import {bundleScope, LexScope} from "../utils";

var spiders : SpiderLib = require("../spiders")

export var _IS_EVENTUAL_KEY_ = "_IS_EVENTUAL_"
var _LOCAL_KEY_ = "_IS_EVENTUAL_"
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
        this[_LOCAL_KEY_] = true
        this.id                 = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        })
        this.isEventual         = true
        this.committedVals      = new Map()
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
export class EventualMirror extends spiders.SpiderIsolateMirror{
    private ignoreInvoc(methodName){
        return methodName == "setHost" || methodName == "resetToCommit" || methodName == "commit" || methodName == "populateCommitted"
    }

    private checkArg(arg){
        if(arg instanceof Array){
            let wrongArgs = arg.filter(this.checkArg)
            return wrongArgs.length > 0
        }
        else if(typeof arg == 'object'){
            //Does this look like I'm stupid ? Yes ! However undefined is not seen as a falsy value for filter while it is in the condition of an if ... go figure
            if(!arg[_LOCAL_KEY_]){
                return true
            }
            else{
                return false
            }
        }
        else{
            return false
        }
    }

    private canInvoke(methodName,args){
        let wrongArgs = args.filter((arg)=>{
            return this.checkArg(arg)
        })
        if(wrongArgs.length > 0){
            let message = "Cannot pas non-eventual arguments to eventual method call: " + methodName
            throw new Error(message)
        }
        else{
            return true
        }
    }

    invoke(methodName,args){
        let baseEV = this.base as Eventual
        if(!baseEV.hostGsp){
            if(this.ignoreInvoc(methodName)){
                return super.invoke(methodName,args)
            }
            else{
                if(this.canInvoke(methodName,args)){
                    return super.invoke(methodName,args)
                }
            }
        }
        else if(!this.ignoreInvoc(methodName)){
            if((baseEV.hostGsp.replay as any).includes(baseEV.id)){
                if(this.canInvoke(methodName,args)){
                    return super.invoke(methodName,args)
                }
            }
            else{
                if(this.canInvoke(methodName,args)){
                    baseEV.hostGsp.createRound(baseEV.id,baseEV.ownerId,methodName,args)
                    let ret = super.invoke(methodName,args)
                    baseEV.hostGsp.yield(baseEV.id,baseEV.ownerId)
                    return ret
                }
            }
        }
        else{
            //No need to check method call constraints, it's a system call
            return super.invoke(methodName,args)
        }
    }

    write(fieldName,value){
        if(this.checkArg(value) && fieldName != "hostGsp" && fieldName != "committedVals"){
            throw new Error("Cannot assign non-eventual argument to eventual field: " + fieldName)
        }
        else{
            return super.write(fieldName,value)
        }
    }
}

let evScope         = new LexScope()
evScope.addElement("_LOCAL_KEY_",_LOCAL_KEY_)
evScope.addElement("EventualMirror",EventualMirror)
bundleScope(Eventual,evScope)
let evMirrorScope   = new LexScope()
evMirrorScope.addElement("_LOCAL_KEY_",_LOCAL_KEY_)
bundleScope(EventualMirror,evMirrorScope)