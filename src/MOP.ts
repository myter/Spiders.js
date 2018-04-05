import {clone, LexScope} from "./utils";
import {SpiderIsolateContainer} from "./serialisation";
import {SpiderActorMirror} from "./MAP";


export class SpiderObjectMirror{
    static mirrorAccessKey = "_SPIDER_OBJECT_MIRROR_"
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

    write(fieldName,value) : boolean{
        this.base[fieldName] = value
        return true
    }

    pass(){
        return makeSpiderObjectProxy(this.base,this,false)
    }

    resolve(){
        //Regular object is sent by far reference, therefore no need to provide a resolve implementation given that this mirror will not be pased along
    }
}

export class SpiderIsolateMirror{
    base : SpiderIsolate

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

    write(fieldName,value) : boolean{
        this.base[fieldName] = value
        return true
    }

    pass(){
        return this.base
    }

    resolve(hostActorMirror : SpiderActorMirror){
        //Regular object is sent by far reference, therefore no need to provide a resolve implementation given that this mirror will not be pased along
    }
}



function isInternal(property){
    return property == "_FAR_REF_" || property == "_PROXY_WRAPPER_" || property == "SPIDER_SERVER_TYPE" || property == "SPIDER_CLIENT_TYPE" || property == "_SERVER_" || property == "_CLIENT_" || property == "_INSTANCEOF_Signal_" || property == "_INSTANCEOF_ISOLATE_" || property == "_INSTANCEOF_ARRAY_ISOLATE_" || property == "_INSTANCEOF_REPLIQ_" || property == "_INSTANCEOF_Signal_" || property == "setEnv" || property == "_SPIDER_OBJECT_" || property == "hasOwnProperty"
}

export function makeSpiderObjectProxy(baseObject : SpiderObject,mirror : SpiderObjectMirror,considerAsObject = true){
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
        },
        set: function(target, property, value, receiver){
            if(!isInternal(property.toString())){
                return mirror.write(property.toString(),value)
            }
            else{
                target[property] = value
                return true
            }
        }
    })
}

export function wrapPrototypes(currentLevel,mirror){
    if(!currentLevel.hasOwnProperty("mirror")) {
        let proto : SpiderObject = Reflect.getPrototypeOf(currentLevel) as SpiderObject
        Reflect.setPrototypeOf(currentLevel,makeSpiderObjectProxy(proto,mirror))
        wrapPrototypes(proto,mirror)
    }
}

export class SpiderObject{
    mirror      : SpiderObjectMirror
    static      spiderObjectKey     = "_SPIDER_OBJECT_"

    constructor(objectMirror : SpiderObjectMirror = new SpiderObjectMirror()){
        //Need to explicitly clone the base object, given that we are going to mess with its prototype chain etc at the end of the constructor
        let thisClone   = clone(this)
        objectMirror.bindBase(thisClone)
        this.mirror     = objectMirror
        this[SpiderObjectMirror.mirrorAccessKey] = this.mirror
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this,this.mirror)
        return makeSpiderObjectProxy(thisClone,this.mirror) as SpiderObject
    }
}

export class SpiderIsolate{
    mirror      : SpiderObjectMirror

    constructor(objectMirror : SpiderIsolateMirror = new SpiderIsolateMirror()){
        this[SpiderIsolateContainer.checkIsolateFuncKey] = true
        //Need to explicitly clone the base object, given that we are going to mess with its prototype chain etc at the end of the constructor
        let lex         = this.constructor[LexScope._LEX_SCOPE_KEY_]
        let thisClone   = clone(this)
        //Cloning appears to break the lexical scope object (maps are wrongly cloned), this is an easy temp fix
        this.constructor[LexScope._LEX_SCOPE_KEY_] = lex
        //this.constructor = construct
        objectMirror.bindBase(thisClone)
        this.mirror     = objectMirror as any
        thisClone[SpiderObjectMirror.mirrorAccessKey] = objectMirror
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this,this.mirror)
        return makeSpiderObjectProxy(thisClone,this.mirror) as SpiderIsolate
    }

    //Called by serialise on an already constructed isolate which has just been passed
    instantiate(objectMirror : SpiderIsolateMirror,isolClone,wrapPrototypes,makeSpiderObjectProxy){
        objectMirror.bindBase(isolClone)
        this.mirror     = objectMirror as any
        isolClone["_SPIDER_OBJECT_MIRROR_"] = objectMirror
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this,this.mirror)
        return makeSpiderObjectProxy(isolClone,this.mirror) as SpiderIsolate
    }
}

//ReCreate functions ensure that deserialised class definitions are evalled in the same scope as the original definitions
export function reCreateIsolateClass(classDefinition,scope : Map<string,any>,superClass = undefined){
    if(superClass){
        let index                           = classDefinition.indexOf("{")
        let start                           = classDefinition.substring(0,index)
        let stop                            = classDefinition.substring(index,classDefinition.length)
        if(scope){
            scope.forEach((value,key)=>{
                this[key] = value
            })
        }
        var classObj                        = eval("("+start + " extends "+superClass+stop+")")
        return classObj
    }
    else{
        if(scope){
            scope.forEach((value,key)=>{
                this[key] = value
            })
        }
        var classObj                        = eval("("+classDefinition+")")
        return classObj
    }
}

export var reCreateObjectClass         = reCreateIsolateClass
export var reCreateObjectMirrorClass   = reCreateIsolateClass
export var reCreateIsolateMirrorClass  = reCreateIsolateClass