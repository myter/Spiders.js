import {clone} from "./utils";

export class SpiderObjectMirror{
    base : SpiderObject

    constructor(base : SpiderObject){
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

    resolve(){
        //TODO
    }
}

function makeSpiderObjectProxy(baseObject : SpiderObject,mirror : SpiderObjectMirror){
    return new Proxy(baseObject,{
        get: function(target,property){
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

    constructor(){
        //Need to explicitly clone the base object, given that we are going to mess with its prototype chain etc at the end of the constructor
        let thisClone   = clone(this)
        this.mirror     = new SpiderObjectMirror(thisClone)
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this,this.mirror)
        return makeSpiderObjectProxy(thisClone,this.mirror) as SpiderObject
    }
}