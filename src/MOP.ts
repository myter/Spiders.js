import {clone, isAnnotatedMethod, LexScope} from "./utils";
import {SpiderIsolateContainer} from "./serialisation";
import {SpiderActorMirror} from "./MAP";

//TODO need to abstract common parts of both kinds of mirrors
export class SpiderObjectMirror{
    static mirrorAccessKey = "_SPIDER_OBJECT_MIRROR_"
    base : SpiderObject
    proxyBase

    bindBase(base){
        this.base = base
    }

    bindProxy(proxy){
        this.proxyBase = proxy
    }

    isAnnotated(methodName){
        return this.base[methodName]["_ANNOT_CALL_"]
    }

    getAnnotationCall(methodName){
        return this.base[methodName]["_ANNOT_CALL_"]
    }

    getAnnotationTag(methodName){
        return this.base[methodName]["_ANNOT_TAG_"]
    }

    annotate(methodName,annotationCall,annotationTag){
        this.base[methodName]["_ANNOT_CALL_"]   = annotationCall
        this.base[methodName]["_ANNOT_TAG_"]    = annotationTag
    }

    /////////////////////////////////////////////////////////////////
    // Intercession                                                //
    /////////////////////////////////////////////////////////////////

    invoke(methodName : PropertyKey,args : Array<any>){
        let method = this.base[methodName]
        let annot  = isAnnotatedMethod(method)
        if(annot){
            annot(this,methodName,args)
        }
        return this.base[methodName](...args)
    }

    access(fieldName){
        return this.base[fieldName]
    }

    write(fieldName,value) : boolean{
        if(typeof value == 'function'){
            Reflect.getPrototypeOf(this.base)[fieldName] = value
        }
        else{
            this.base[fieldName] = value
        }
        return true
    }

    pass(hostActorMirror : SpiderActorMirror){
        return makeSpiderObjectProxy(this.base,this,false)
    }

    resolve(hostActorMirror : SpiderActorMirror){
        //Regular object is sent by far reference, therefore no need to provide a resolve implementation given that this mirror will not be pased along
        return this.proxyBase
    }

    /////////////////////////////////////////////////////////////////
    // Introspection                                               //
    /////////////////////////////////////////////////////////////////


    getFields() :Array<{name:string,value:any}>{
        let keys = Reflect.ownKeys(this.base)
        return keys.map((key)=>{
            return this.getField(key.toString())
        })
    }

    getMethods(){
        return Reflect.ownKeys(this.base).map((key)=>{
            return this.getMethod(key.toString())
        })
    }

    getField(name : string) : {name: string,value: any}{
        return {name : name,value: Reflect.get(this.base,name)}
    }


    getMethod(name : string) : {name: string,value: Function}{
        return this.getField(name)
    }



    /////////////////////////////////////////////////////////////////
    // self-modification                                           //
    /////////////////////////////////////////////////////////////////

    addField(name : string,value : any){
        this.base[name] = value
    }

    addMethod(name : string,value : Function){
        this.base[name] = value.bind(this.base)
    }
}

export class SpiderIsolateMirror{
    base : SpiderIsolate
    proxyBase

    constructor(){
        this[SpiderIsolateContainer.checkIsolateFuncKey] = true
    }

    /////////////////////////////////////////////////////////////////
    // Experimental                                                //
    /////////////////////////////////////////////////////////////////

    bindBase(base){
        this.base = base
    }

    bindProxy(proxy){
        this.proxyBase = proxy
    }

    isAnnotated(methodName){
        return this.base[methodName]["_ANNOT_CALL_"]
    }

    getAnnotationCall(methodName){
        return this.base[methodName]["_ANNOT_CALL_"]
    }

    getAnnotationTag(methodName){
        return this.base[methodName]["_ANNOT_TAG_"]
    }

    annotate(methodName,annotationCall,annotationTag){
        this.base[methodName]["_ANNOT_CALL_"]   = annotationCall
        this.base[methodName]["_ANNOT_TAG_"]    = annotationTag
    }

    /////////////////////////////////////////////////////////////////
    // Intercession                                                //
    /////////////////////////////////////////////////////////////////

    invoke(methodName : PropertyKey,args : Array<any>){
        let method = this.base[methodName]
        let annot  = isAnnotatedMethod(method)
        if(annot){
            annot(this,methodName,args)
        }
        return this.base[methodName](...args)
    }

    access(fieldName){
        return this.base[fieldName]
    }

    write(fieldName,value) : boolean{
        if(typeof value == 'function'){
            Reflect.getPrototypeOf(this.base)[fieldName] = value
        }
        else{
            this.base[fieldName] = value
        }
        return true
    }

    pass(hostActorMirror : SpiderActorMirror){
        return this.base
    }

    resolve(hostActorMirror : SpiderActorMirror){
        return this.proxyBase
    }

    /////////////////////////////////////////////////////////////////
    // Introspection                                               //
    /////////////////////////////////////////////////////////////////

    getFields() :Array<{name:string,value:any}>{
        let keys = Reflect.ownKeys(this.base)
        return keys.map((key)=>{
            return this.getField(key.toString())
        })
    }

    getMethods(){
        return Reflect.ownKeys(this.base).map((key)=>{
            return this.getMethod(key.toString())
        })
    }

    getField(name : string) : {name: string,value: any}{
        return {name : name,value: Reflect.get(this.base,name)}
    }

    getMethod(name : string) : {name: string,value: Function}{
        return this.getField(name)
    }

    /////////////////////////////////////////////////////////////////
    // self-modification                                           //
    /////////////////////////////////////////////////////////////////

    addField(name : string,value : any){
        this.base[name] = value
    }

    addMethod(name : string,value : Function){
        this.base[name] = value.bind(this.base)
    }
}



function isInternal(property){
    return property == "_FAR_REF_" || property == "_PROXY_WRAPPER_" || property == "SPIDER_SERVER_TYPE" || property == "SPIDER_CLIENT_TYPE" || property == "_SERVER_" || property == "_CLIENT_" || property == "_INSTANCEOF_Signal_" || property == "_INSTANCEOF_ISOLATE_" || property == "_INSTANCEOF_ARRAY_ISOLATE_" || property == "_INSTANCEOF_REPLIQ_" || property == "_INSTANCEOF_Signal_" || property == "setEnv" || property == "_SPIDER_OBJECT_" || property == "hasOwnProperty"
}

//Taken from the following thread:
//https://stackoverflow.com/questions/34255580/bind-that-does-not-return-native-code-in-javascript
//Binding using Javascript's bind messes up the function's toString() method (returns [native code])
//Might need the function's source for serialisation etc
export function simpleBind(fun, ctx){
    var newFun = function(){
        return fun.apply(ctx, arguments);
    }
    newFun.toString = function(){
        return fun.toString();
    };
    (newFun as any).unBind = function(){
        return fun
    }
    return newFun;
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
        let proxied = makeSpiderObjectProxy(thisClone,this.mirror) as SpiderObject
        for(var i in thisClone){
            if(typeof thisClone[i] == 'function' && i != "constructor"){
                let original = thisClone[i]
                let toCopy   = []
                Reflect.ownKeys(original).forEach((key)=>{
                    if(key != "length" && key != "name" && key != "arguments" && key != "caller" && key != "prototype"){
                        toCopy.push([key,original[key]])
                    }
                })
                thisClone[i] = simpleBind(thisClone[i],proxied)
                toCopy.forEach(([key,val])=>{
                    thisClone[i][key] = val
                })
            }
        }
        objectMirror.bindProxy(proxied)
        return proxied
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
        let proxied = makeSpiderObjectProxy(thisClone,this.mirror) as SpiderIsolate
        for(var i in thisClone){
            if(typeof thisClone[i] == 'function'){
                let original = thisClone[i]
                let toCopy   = []
                Reflect.ownKeys(original).forEach((key)=>{
                    if(key != "length" && key != "name" && key != "arguments" && key != "caller" && key != "prototype"){
                        toCopy.push([key,original[key]])
                    }
                })
                thisClone[i] = simpleBind(thisClone[i],proxied)
                toCopy.forEach(([key,val])=>{
                    thisClone[i][key] = val
                })
            }
        }
        objectMirror.bindProxy(proxied)
        return proxied
    }

    //Called by serialise on an already constructed isolate which has just been passed
    instantiate(objectMirror : SpiderIsolateMirror,isolClone,wrapPrototypes,makeSpiderObjectProxy,simpleBind){
        objectMirror.bindBase(isolClone)
        this.mirror     = objectMirror as any
        isolClone["_SPIDER_OBJECT_MIRROR_"] = objectMirror
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this,this.mirror)
        let proxied = makeSpiderObjectProxy(isolClone,this.mirror) as SpiderIsolate
        for(var i in isolClone){
            if(typeof isolClone[i] == 'function'){
                let original = isolClone[i]
                let toCopy   = []
                Reflect.ownKeys(original).forEach((key)=>{
                    if(key != "length" && key != "name" && key != "arguments" && key != "caller" && key != "prototype"){
                        toCopy.push([key,original[key]])
                    }
                })
                isolClone[i] = simpleBind(isolClone[i],proxied)
                toCopy.forEach(([key,val])=>{
                    isolClone[i][key] = val
                })
            }
        }
        objectMirror.bindProxy(proxied)
        return proxied
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