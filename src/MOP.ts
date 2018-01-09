import {clone} from "./utils";
import {SpiderIsolateContainer} from "./serialisation";
import {ActorEnvironment} from "./ActorEnvironment";

//TODO 1: need to call pass and resolve at the right spots in base code (where are objects serialised, behaviour, after access and invocation ? )
export class SpiderObjectMirror{
    static mirrorAccessKey = "_SPIDER_OBJECT_MIRROR_"
    base : SpiderObject

    constructor(){
        this[SpiderIsolateContainer.checkIsolateFuncKey] = true
    }

    bindBase(base){
        this.base = base
    }

    invoke(methodName : PropertyKey,args : Array<any>){
        return this.base[methodName](...args)
    }

    access(fieldName){
        return this.base[fieldName]
    }

    pass(){
        return makeSpiderObjectProxy(this.base,this,false)
    }

    resolve(stringRepresentation){
        //Regular object is sent by far reference, therefore no need to provide a resolve implementation given that this mirror will not be pased along
    }
}



function isInternal(property){
    return property == "_FAR_REF_" || property == "_PROXY_WRAPPER_" || property == "SPIDER_SERVER_TYPE" || property == "SPIDER_CLIENT_TYPE" || property == "_SERVER_" || property == "_CLIENT_" || property == "_INSTANCEOF_Signal_" || property == "_INSTANCEOF_ISOLATE_" || property == "_INSTANCEOF_ARRAY_ISOLATE_" || property == "_INSTANCEOF_REPLIQ_" || property == "_INSTANCEOF_Signal_" || property == "setEnv" || property == "_SPIDER_OBJECT_"
}

function makeSpiderObjectProxy(baseObject : SpiderObject,mirror : SpiderObjectMirror,considerAsObject = true){
    return new Proxy(baseObject,{
        get: function(target,property){
            if(property.toString() == SpiderObjectMirror.mirrorAccessKey){
                return mirror
            }
            else if(property.toString() == SpiderObject.spiderObjectKey){
                return considerAsObject
            }
            else if(isInternal(property.toString())){
                let prop = baseObject[property]
                if(typeof prop === 'function'){
                    return (...args)=>{
                        return mirror.base[property](...args)
                    }
                }
                else{
                    return mirror.base[property]
                }
            }
            else{
                let prop = baseObject[property]
                if(typeof prop === 'function'){
                    return (...args)=>{
                        return mirror.invoke(property,args)
                    }
                }
                else{
                    return mirror.access(property)
                }
            }
        }
    })
}

function wrapPrototypes(currentLevel,mirror){
    if(!currentLevel.hasOwnProperty("__defineGetter__")) {
        let proto : SpiderObject = Reflect.getPrototypeOf(currentLevel) as SpiderObject
        Reflect.setPrototypeOf(currentLevel,makeSpiderObjectProxy(proto,mirror))
        wrapPrototypes(proto,mirror)
    }
}

export class SpiderObject{
    mirror      : SpiderObjectMirror
    environment : ActorEnvironment
    static      spiderObjectKey     = "_SPIDER_OBJECT_"

    constructor(objectMirror : SpiderObjectMirror = new SpiderObjectMirror()){
        //Need to explicitly clone the base object, given that we are going to mess with its prototype chain etc at the end of the constructor
        let thisClone   = clone(this)
        objectMirror.bindBase(thisClone)
        this.mirror     = objectMirror
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this,this.mirror)
        return makeSpiderObjectProxy(thisClone,this.mirror) as SpiderObject
    }

    setEnv(env){
        this.environment = env
    }
}

export class SpiderIsolate{
    mirror      : SpiderObjectMirror
    environment : ActorEnvironment

    constructor(objectMirror : SpiderObjectMirror = new SpiderObjectMirror()){
        this[SpiderIsolateContainer.checkIsolateFuncKey] = true
        //Need to explicitly clone the base object, given that we are going to mess with its prototype chain etc at the end of the constructor
        let thisClone   = clone(this)
        objectMirror.bindBase(thisClone)
        this.mirror     = objectMirror
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this,this.mirror)
        return makeSpiderObjectProxy(thisClone,this.mirror) as SpiderObject
    }

    setEnv(env){
        this.environment = env
    }
}