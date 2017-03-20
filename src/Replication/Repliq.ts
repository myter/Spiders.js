import {RepliqContainer} from "../serialisation";
import {GSP, ReplicaId} from "./GSP";
import {RepliqField} from "./RepliqField";
import {FieldUpdate, Round} from "./Round";
import {listenerCount} from "cluster";
var utils = require("../utils")
/**
 * Created by flo on 16/03/2017.
 */

export function atomic(target : any,propertyKey : string,descriptor : PropertyDescriptor){
    let originalMethod = descriptor.value
    originalMethod[Repliq.isAtomic] = true
    return {
        value : originalMethod
    }
}

class OnceCommited{
    gspInstance : GSP
    listenerID  : string

    constructor(gspInstance : GSP,listenerID : string){
        this.gspInstance    = gspInstance
        this.listenerID     = listenerID
    }

    onceCommited(callback){
        this.gspInstance.registerRoundListener(callback,this.listenerID)
    }
}


export class Repliq{
    static getRepliqFields              = "_GET_REPLIQ_FIELDS_"
    static getRepliqID                  = "_GET_REPLIQ_ID_"
    static getRepliqOwnerID             = "_GET_REPLIQ_OWNER_ID_"
    static getRepliqOriginalMethods     = "_GET_REPLIQ_ORIGI_METHODS_"
    static resetRepliqCommit            = "_RESET_REPLIQ_"
    static commitRepliq                 = "_COMMIT_"
    static isAtomic                     = "_IS_ATOMIC_"

    private isMetaField(fieldName : string) : boolean{
        return fieldName == Repliq.getRepliqFields || fieldName == Repliq.getRepliqID || fieldName == Repliq.getRepliqOwnerID || fieldName == Repliq.getRepliqOriginalMethods || fieldName == Repliq.resetRepliqCommit || fieldName == Repliq.commitRepliq || fieldName == RepliqContainer.checkRepliqFuncKey
    }

    private makeAtomicMethodProxyHandler(gspInstance : GSP,objectId : ReplicaId,ownerId : string,methodName : string,fields : Map<string,RepliqField<any>>){
        return {
            apply: function(target,thisArg,args){
                let round
                if(!gspInstance.inReplay(objectId)){
                    round = gspInstance.newRound(objectId,ownerId,methodName,args)
                }
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                let thisProxy = new Proxy(thisArg,{
                    set : function(target,property,value,receiver){
                        let gspField = fields.get(<string> property)
                        if(!gspInstance.inReplay(objectId)){
                            let update = new FieldUpdate(property,gspField.read(),value)
                            round.addUpdate(update)
                        }
                        gspField.writeField(value)
                        return true
                    }
                })
                let res = target.apply(thisProxy,args)
                if(!gspInstance.inReplay(objectId)){
                    gspInstance.yield(objectId,ownerId)
                    return new OnceCommited(gspInstance,round.listenerID)
                }
                else{
                    return res
                }
            }
        }
    }

    private makeMethodProxyHandler(gspInstance : GSP,objectId : ReplicaId,ownerId : string,methodName : string,fields : Map<string,RepliqField<any>>){
        return {
            apply: function(target,thisArg,args){
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                let round
                let thisProxy = new Proxy(thisArg,{
                    set : function(target,property,value,receiver){
                        let gspField = fields.get(<string> property)
                        if(!gspInstance.inReplay(objectId)){
                            round  = gspInstance.newRound(objectId,ownerId,methodName,args)
                            let update = new FieldUpdate(property,gspField.read(),value)
                            round.addUpdate(update)
                            gspInstance.yield(objectId,ownerId)
                        }
                        gspField.writeField(value)
                        return true
                    }
                })
                let res = target.apply(thisProxy,args)
                if(!gspInstance.inReplay(objectId)){
                    return new OnceCommited(gspInstance,round.listenerID)
                }
                else{
                    return res
                }
            }
        }
    }

    private  makeProxyHandler(fields : Map<string,RepliqField<any>>, originalMethods : Map<string,Function>, objectID : ReplicaId, ownerId : string){
        var that = this
        return {
            set : function(target,property,value,receiver){
                throw new Error("Assignment of Repliq fields not allowed")
            },
            get : function(target,name){
                if(Reflect.has(target,name) || that.isMetaField(name)){
                    var property = Reflect.get(target,name)
                    if(typeof property != 'function'){
                        if(name == Repliq.getRepliqID){
                            return objectID
                        }
                        else if(name == Repliq.getRepliqOwnerID){
                            return ownerId
                        }
                        else if(name == Repliq.getRepliqFields){
                            return fields
                        }
                        else if(name == Repliq.getRepliqOriginalMethods){
                            return originalMethods
                        }
                        else if(name == Repliq.resetRepliqCommit){
                            return (updates) => {
                                Reflect.ownKeys(updates).forEach((key)=>{
                                    fields.get(key.toString()).resetToCommit()
                                })
                            }
                        }
                        else if(name == Repliq.commitRepliq){
                            return (updates) => {
                                Reflect.ownKeys(updates).forEach((key) => {
                                    fields.get(key.toString()).commit()
                                })
                            }
                        }
                        else if(name == RepliqContainer.checkRepliqFuncKey){
                            return true
                        }
                        else {
                            var field = fields.get(name)
                            //Wrap value in an object in order to be able to install onCommit and onTentative listeners
                            let val   = Object(field.read())
                            Reflect.set(val,"onCommit",(callback)=>{
                                field.onCommit(callback)
                            })
                            Reflect.set(val,"onTentative",(callback)=>{
                                field.onTentative(callback)
                            })
                            return val
                        }
                    }
                    else{
                        return property
                    }
                }
                else{
                    return undefined
                }

            }
        }
    }

    instantiate(gspInstance : GSP,thisActorId : string){
        this[RepliqContainer.checkRepliqFuncKey] = true
        let objectToProxy   = {}
        let proxyProto      = {}
        Object.setPrototypeOf(objectToProxy,proxyProto)
        let fields          = new Map()
        let originalMethods = new Map()
        let repliqId        = utils.generateId()
        let fieldKeys       = Reflect.ownKeys(this)
        let methodKeys      = Reflect.ownKeys(Object.getPrototypeOf(this))
        let handler         = this.makeProxyHandler(fields,originalMethods,repliqId,thisActorId)
        //"Regular" fields are transformed into standard LWR Fields
        fieldKeys.forEach((key)=>{
            var gspField = Reflect.get(this,key)
            if(!(gspField instanceof RepliqField)){
                gspField = new RepliqField(key.toString(),gspField)
            }
            fields.set(key.toString(),gspField)
            Reflect.set(objectToProxy,key,gspField)
        })
        //Replace all methods with proxies which intercept apply to log method application
        methodKeys.shift() // First entry is always constructor method
        methodKeys.forEach((key)=>{
            var property    = Reflect.get(Object.getPrototypeOf(this),key)
            originalMethods.set(key,property)
            let proxyMethod
            if(property[Repliq.isAtomic]){
                proxyMethod = new Proxy(property,this.makeAtomicMethodProxyHandler(gspInstance,repliqId,thisActorId,key.toString(),fields))
            }
            else{
                proxyMethod = new Proxy(property,this.makeMethodProxyHandler(gspInstance,repliqId,thisActorId,key.toString(),fields))
            }
            Reflect.set(Object.getPrototypeOf(objectToProxy),key,proxyMethod)
        })
        let repliqProxy     = new Proxy(objectToProxy,handler)
        gspInstance.newMasterRepliq(repliqProxy,repliqId)
        return repliqProxy
    }

    reconstruct(gspInstance : GSP,repliqId : string,repliqOwnerId : string,fields : Map<string,RepliqField<any>>,methods  : Map<string,Function>,atomicMethods : Map<string,Function>){
        let objectToProxy   = {}
        let protoToProxy    = {}
        Object.setPrototypeOf(objectToProxy,protoToProxy)
        fields.forEach((repliqField,fieldName)=>{
            Reflect.set(objectToProxy,fieldName,repliqField)
        })
        methods.forEach((method,methodName)=>{
            let proxyMethod  = new Proxy(method,this.makeMethodProxyHandler(gspInstance,repliqId,repliqOwnerId,methodName,fields))
            Reflect.set(protoToProxy,methodName,proxyMethod)
        })
        atomicMethods.forEach((method,methodName)=>{
            method[Repliq.isAtomic] = true
            let proxyMethod = new Proxy(method,this.makeAtomicMethodProxyHandler(gspInstance,repliqId,repliqOwnerId,methodName,fields))
            Reflect.set(protoToProxy,methodName,proxyMethod)
            //Store the atomic method in regular methods (in case this repliq is serialised again
            methods.set(methodName,method)
        })
        let handler         = this.makeProxyHandler(fields,methods,repliqId,repliqOwnerId)
        let repliqProxy     = new Proxy(objectToProxy,handler)
        gspInstance.registerReplica(repliqId,repliqProxy)
        return repliqProxy
    }
}