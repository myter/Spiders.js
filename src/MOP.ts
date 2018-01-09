import {clone} from "./utils";
import {ValueContainer} from "./serialisation";

export class SpiderObjectMirror{
    base : SpiderObject

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
        //TODO
    }

    resolve(ValueContainer){
        //TODO
    }
}



function isInternal(property){
    return property == "_FAR_REF_" || property == "_PROXY_WRAPPER_" || property == "SPIDER_SERVER_TYPE" || property == "SPIDER_CLIENT_TYPE" || property == "_SERVER_" || property == "_CLIENT_" || property == "_INSTANCEOF_Signal_" || property == "_INSTANCEOF_ISOLATE_" || property == "_INSTANCEOF_ARRAY_ISOLATE_" || property == "_INSTANCEOF_REPLIQ_" || property == "_INSTANCEOF_Signal_"
}

function makeSpiderObjectProxy(baseObject : SpiderObject,mirror : SpiderObjectMirror){
    return new Proxy(baseObject,{
        get: function(target,property){
            if(isInternal(property.toString())){
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
    mirror : SpiderObjectMirror

    constructor(objectMirror : SpiderObjectMirror = new SpiderObjectMirror()){
        //Need to explicitly clone the base object, given that we are going to mess with its prototype chain etc at the end of the constructor
        let thisClone   = clone(this)
        objectMirror.bindBase(thisClone)
        this.mirror     = objectMirror
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this,this.mirror)
        return makeSpiderObjectProxy(thisClone,this.mirror) as SpiderObject
    }
}