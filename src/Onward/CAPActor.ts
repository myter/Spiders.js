import {GSP} from "./GSP";
import {Eventual} from "./Eventual";
import {FarRef, SpiderLib} from "../spiders";

var spiders : SpiderLib = require("../spiders")
export class CAPMirror extends spiders.SpiderActorMirror{

    private getEventualArgs(args : Array<any>){
        return args.filter((arg,index)=>{
            if(arg){
                //No this isn't some dumb mistake, must ensure that it is true and not a true-like value!
                return arg.isEventual == true
            }
            else{
                return false
            }
        })
    }

    receiveInvocation(sender : FarRef,targetObject : Object,methodName : string,args : Array<any>,performInvocation : () => void = () => {}){
        let eventualArgs = this.getEventualArgs(args)
        let gsp = (this.base.behaviourObject as CAPActor).gsp
        if(eventualArgs.length > 0){
            sender.gsp.then((senderGSPRef)=>{
                eventualArgs.forEach((eventual : Eventual)=>{
                    gsp.registerHolderEventual(eventual,senderGSPRef)
                })
            })
        }
        super.receiveInvocation(sender,targetObject,methodName,args,performInvocation)
    }

    sendInvocation(target : FarRef,methodName : string,args : Array<any>,contactId = this.base.thisRef.ownerId,contactAddress = null,contactPort = null,mainId = null){
        let eventualArgs = this.getEventualArgs(args)
        let gsp = (this.base.behaviourObject as CAPActor).gsp
        if(methodName == "get"){
            let ev = args[0]
            for(var i in ev){
                console.log(i)
            }
        }
        eventualArgs.forEach((eventual : Eventual)=>{
            //An eventual is being sent to another actor, without that eventual being already registered
            //In other words, this eventual must have been created newly by the sending actor
            console.log(eventual.id + "Known eventual in master ? " + gsp.knownEventual(eventual.id))
            if(!gsp.knownEventual(eventual.id)){
                gsp.registerMasterEventual(eventual)
                eventual.setHost(gsp)
            }
        })
        return super.sendInvocation(target,methodName,args,contactId,contactAddress,contactPort,mainId)
    }
}
export class CAPActor extends spiders.Actor{
    gsp : GSP
    GSP

    constructor(){
        super(new CAPMirror())
        this.GSP    = require("./GSP").GSP
    }

    init(){
        this.gsp = new this.GSP(this.reflectOnActor().base.thisRef.ownerId)
    }
}
