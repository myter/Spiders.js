

import {PromiseAllocation} from "./PromisePool";
import {ResolvePromiseMessage, RejectPromiseMessage} from "./Message";
import {ObjectPool} from "./ObjectPool";
import {ServerFarReference, FarReference, ClientFarReference} from "./FarRef";
import {ActorEnvironment} from "./ActorEnvironment";
import {
    ClassDefinitionChain,
    getClassDefinitionChain, getSerialiableClassDefinition, hasLexScope, isAnnotatedMethod, LexScope,
    reconstructClassDefinitionChain
} from "./utils";
import {makeSpiderObjectProxy, simpleBind, SpiderObject, SpiderObjectMirror, wrapPrototypes} from "./MOP";
/**
 * Created by flo on 19/12/2016.
 */


export function getObjectVars(object : Object,receiverId : string,environment : ActorEnvironment,ignoreSet : Array<string> = []) : Array<any>{
    var vars        = []
    var properties  = Reflect.ownKeys(object)
    for(var i in properties){
        var key             = properties[i]
        if(!(ignoreSet as any).includes(key)){
            var val             = Reflect.get(object,key)
            var serialisedval   = serialise(val,receiverId,environment)
            vars.push([key,serialisedval])
        }
    }
    return vars
}

export function getObjectMethods(object : Object) : Array<any>{
    var methods     = []
    var proto       = Object.getPrototypeOf(object)
    var properties  = Reflect.ownKeys(proto)
    for(var i in properties){
        var key     = properties[i]
        var method  = Reflect.get(proto,key)
        //Avoid copying over any construction functions (i.e. class declarations)
        if(typeof method == 'function' && !(method.toString()).startsWith("class")){
            methods.push([key,method.toString()])
        }
    }
    return methods
}

export function getObjectNames(object : Object,lastProp : string,accumVars = [],accumMethods = []){
    var properties          = Reflect.ownKeys(object)
    var lastProto           = properties.indexOf(lastProp) != -1
    if(lastProto){
        return [accumVars,accumMethods]
    }
    else{
        for(var i in properties){
            let key             = properties[i]
            let val             = Reflect.get(object,key)
            let k               = key.toString()
            if(typeof val == 'function'){
                if(!(accumMethods as any).includes(k)){
                    accumMethods.push(k)
                }
            }
            else{
                if(!(accumVars as any).includes(k)){
                    accumVars.push(k)
                }
            }
        }
        return getObjectNames(Reflect.getPrototypeOf(object),lastProp,accumVars,accumMethods)
    }
}

export function deconstructStatic(actorClass,receiverId : string,results : Array<any>,environment : ActorEnvironment){
    //Reached the end of the class chain (i.e. current class is function(){})
    if(actorClass.name == ""){
        return results
    }
    else{
        var thisName    = actorClass.name
        var thisVars    = []
        var thisMethods = []
        var keys        = Reflect.ownKeys(actorClass)
        keys.forEach((key)=>{
            //Avoid sending the prototype and other function specific properties (given that classes are just functions)
            if(!(key == "prototype" || key == "name" || key == "length")){
                var property = Reflect.get(actorClass,key)
                if(property instanceof Function){
                    thisMethods.push([key,property.toString()])
                }
                else{
                    thisVars.push([key,serialise(property,receiverId,environment)])
                }
            }
        })
        results.push([thisName,thisVars,thisMethods])
        return deconstructStatic(actorClass.__proto__,receiverId,results,environment)
    }
}

function convert(inputString : string){
    let reg     = new RegExp(/(super\.)(.*?\()((.|[\r\n])*)/)
    //let parts   = inputString.match(/(super\.)(.*?\()((.|[\r\n])*)/)
    let parts   = inputString.match(reg)
    parts[2]    = parts[2].replace('(','.bind(this)(')
    let prefix  = inputString.substring(0,parts.index)
    if(parts[3].match(reg)){
        return prefix + parts[1]+ parts[2] + convert(parts[3])
    }
    else{
        return prefix + parts[1]+ parts[2] + parts[3]
    }
}

function constructMethod(functionSource){
    //JS disallows the use of super outside of method context (which is the case if you eval a function as a string)
    //Replace all supers with proto calls
    if(functionSource.includes("super")){
        functionSource = convert(functionSource)
        functionSource = functionSource.replace(new RegExp("super", 'g'),"((this.__proto__).__proto__)")
    }
    if(functionSource.startsWith("function")){
        var method =  eval( "(" +  functionSource +")" )
    }
    else if(functionSource.startsWith("(")){
        var method = eval(functionSource)
    }
    else{
        var method =  eval("(function " + functionSource + ")" )
    }
    return method
}

export function reconstructStatic(behaviourObject : Object,staticProperties : Array<any>,environment : ActorEnvironment){
    staticProperties.forEach((propertyArray : Array<any>)=>{
        var className   = propertyArray[0]
        var stub        = {}
        var vars        = propertyArray[1]
        var methods     = propertyArray[2]
        vars.forEach((varPair : Array<any>)=>{
            var key     = varPair[0]
            var val     = deserialise(varPair[1],environment)
            stub[key]   = val
        })
        methods.forEach((methodPair : Array<any>)=>{
            var key                 = methodPair[0]
            var functionSource      = methodPair[1]
            stub[key]               = constructMethod(functionSource)
        })
        var stubProxy   = new Proxy(stub,{
            set: function(obj,prop,value){
                throw new Error("Cannot mutate static property in actors")
            }
        })
        behaviourObject[className] = stubProxy
    })
}

export function deconstructBehaviour(object : any,currentLevel : number,accumVars : Array<any>,accumMethods : Array<any>,accumMethodAnnots : Array<any>,receiverId : string,environment : ActorEnvironment,lastProp : string){
    var properties          = Reflect.ownKeys(object)
    var localAccumVars      = []
    for(var i in properties){
        var key             = properties[i]
        var val             = Reflect.get(object,key)
        /*if((typeof val != 'function' || isSpiderObjectClass(val) || isSpiderIsolateClass(val) || isObjectMirrorClass(val) || isIsolateMirrorClass(val) || isRepliqClass(val) || isSignalClass(val)) && key != "constructor"){
            var serialisedval   = serialise(val,receiverId,environment)
            localAccumVars.push([key,serialisedval])
        }*/
        if((typeof val != 'function' || isClass(val)) && key != "constructor"){
            var serialisedval   = serialise(val,receiverId,environment)
            localAccumVars.push([key,serialisedval])
        }
    }
    localAccumVars.unshift(currentLevel)
    accumVars.push(localAccumVars)
    var localAccumMethods   = []
    var localAccumMethAnnot = []
    var proto               = Reflect.getPrototypeOf(object)
    properties              = Reflect.ownKeys(proto)
    var lastProto           = properties.indexOf(lastProp) != -1
    if(!lastProto){
        for(var i in properties){
            var key     = properties[i]
            var method  = Reflect.get(proto,key)
            if(typeof method == 'function' && key != "constructor"){
                if(isAnnotatedMethod(method)){
                    localAccumMethAnnot.push([key,method["_ANNOT_CALL_"].toString(),method["_ANNOT_TAG_"]])
                }
                localAccumMethods.push([key,method.toString()])
            }
        }
        localAccumMethods.unshift(currentLevel + 1)
        localAccumMethAnnot.unshift(currentLevel + 1)
        accumMethods.push(localAccumMethods)
        accumMethodAnnots.push(localAccumMethAnnot)
        return deconstructBehaviour(proto,currentLevel + 1,accumVars,accumMethods,accumMethodAnnots,receiverId,environment,lastProp)
    }
    else{
        return [accumVars,accumMethods,accumMethodAnnots]
    }
}

export function reconstructBehaviour(baseObject : any,variables :Array<any>, methods : Array<any>,methodAnnotations : Array<any>,environment : ActorEnvironment) {
    var amountOfProtos = methods.length
    for(var i = 0;i < amountOfProtos;i++){
        var copy                = baseObject.__proto__
        var newProto : any      = {}
        newProto.__proto__      = copy
        baseObject.__proto__    = newProto
    }
    variables.forEach((levelVariables) => {
        var installIn   = getProtoForLevel(levelVariables[0],baseObject)
        levelVariables.shift()
        levelVariables.forEach((varEntry)=>{
            var key             = varEntry[0]
            var rawVal          = varEntry[1]
            var val             = deserialise(rawVal,environment)
            installIn[key]      = val
        })
    })
    methods.forEach((levelMethods) => {
        var installIn = getProtoForLevel(levelMethods[0],baseObject)
        levelMethods.shift()
        levelMethods.forEach((methodEntry)=>{
            var key               = methodEntry[0]
            var functionSource    = methodEntry[1]
            installIn[key]        = constructMethod(functionSource)
        })
    })
    methodAnnotations.forEach((levelAnnotations)=>{
        let installIn = getProtoForLevel(levelAnnotations[0],baseObject)
        levelAnnotations.shift()
        levelAnnotations.forEach((annot)=>{
            let methName            = annot[0]
            let annotF              = annot[1]
            let annotTag            = annot[2]
            let meth                = installIn[methName]
            meth["_ANNOT_CALL_"]    = constructMethod(annotF)
            meth["_ANNOT_TAG_"]     = annotTag
        })
    })
    return baseObject
}


function getProtoForLevel(level,object){
    var ret = object
    for(var i = 0;i < level;i++){
        ret = ret.__proto__
    }
    return ret
}

export function reconstructObject(baseObject : any,variables :Array<any>, methods : Array<any>,environment : ActorEnvironment) {
    variables.forEach((varEntry) => {
        var key             = varEntry[0]
        var rawVal          = varEntry[1]
        var val             = deserialise(rawVal,environment)
        baseObject[key]     = val
    })
    methods.forEach((methodEntry) => {
        var key               = methodEntry[0]
        var functionSource    = methodEntry[1];
        (baseObject.__proto__)[key]        = constructMethod(functionSource)
    })
    return baseObject
}

export abstract class ValueContainer{
    static nativeType           : number = 0
    static promiseType          : number = 1
    static serverFarRefType     : number = 2
    static errorType            : number = 3
    static arrayType            : number = 4
    static isolateType          : number = 5
    static isolateDefType       : number = 6
    static clientFarRefType     : number = 7
    static repliqType           : number = 9
    static repliqFieldType      : number = 10
    static repliqDefinition     : number = 11
    static signalType           : number = 12
    static signalDefinition     : number = 13
    static spiderObjectDef      : number = 14
    static objectMirrorDef      : number = 15
    static spiderIsolDef        : number = 16
    static isolMirrorDef        : number = 17
    static classDefType         : number = 18
    static mapType              : number = 19
    type                        : number

    constructor(type : number){
        this.type = type
    }
}

type NativeValue = Buffer | number | boolean | string | null
export class NativeContainer extends ValueContainer{
    value : NativeValue
    constructor(value : NativeValue){
        super(ValueContainer.nativeType)
        this.value = value
    }
}

export class PromiseContainer extends ValueContainer{
    promiseId           : number
    promiseCreatorId    : string
    constructor(promiseId : number,promiseCreatorId : string){
        super(ValueContainer.promiseType)
        this.promiseId          = promiseId
        this.promiseCreatorId   = promiseCreatorId
    }
}

export class ServerFarRefContainer extends ValueContainer{
    objectId        : number
    objectFields    : Array<string>
    objectMethods   : Array<string>
    ownerId         : string
    ownerAddress    : string
    ownerPort       : number
    constructor(objectId : number,objectFields : Array<string>,objectMethods : Array<string>,ownerId : string,ownerAddress : string,ownerPort : number){
        super(ValueContainer.serverFarRefType)
        this.objectId       = objectId
        this.objectFields   = objectFields
        this.objectMethods  = objectMethods
        this.ownerId        = ownerId
        this.ownerAddress   = ownerAddress
        this.ownerPort      = ownerPort
    }
}

export class ClientFarRefContainer extends ValueContainer{
    objectId        : number
    objectFields    : Array<string>
    objectMethods   : Array<string>
    ownerId         : string
    mainId          : string
    contactId       : string
    contactAddress  : string
    contactPort     : number

    constructor(objectId : number,objectFields : Array<string>,objectMethods : Array<string>,ownerId : string,mainId : string,contactId : string,contactAddress : string, contactPort : number){
        super(ValueContainer.clientFarRefType)
        this.objectId       = objectId
        this.objectFields   = objectFields
        this.objectMethods  = objectMethods
        this.ownerId        = ownerId
        this.mainId         = mainId
        this.contactId      = contactId
        this.contactAddress = contactAddress
        this.contactPort    = contactPort
    }
}

export class ErrorContainer extends ValueContainer{
    message : string
    stack   : string
    name    : string
    constructor(error : Error){
        super(ValueContainer.errorType)
        this.message    = error.message
        this.stack      = error.stack
        this.name       = error.name
    }
}

export class ArrayContainer extends ValueContainer{
    values : Array<ValueContainer>
    constructor(values : Array<ValueContainer>){
        super(ValueContainer.arrayType)
        this.values = values
    }
}

export class SpiderObjectDefinitionContainer extends ValueContainer{
    definitions : Array<string>
    scopes      : Array<ValueContainer>
    methodAnnot : Array<ValueContainer>

    constructor(definitions : Array<string>,scopes : Array<ValueContainer>,methodAnnotations : Array<ValueContainer>){
        super(ValueContainer.spiderObjectDef)
        this.definitions    = definitions
        this.scopes         = scopes
        this.methodAnnot    = methodAnnotations
    }
}

export class SpiderIsolateDefinitionContainer extends ValueContainer{
    definitions : Array<string>
    scopes      : Array<ValueContainer>
    methodAnnot : Array<ValueContainer>

    constructor(definitions : Array<string>,scopes : Array<ValueContainer>,methodAnnotations : Array<ValueContainer>){
        super(ValueContainer.spiderIsolDef)
        this.definitions    = definitions
        this.scopes         = scopes
        this.methodAnnot    = methodAnnotations
    }
}

export class SpiderIsolateContainer extends ValueContainer{
    static checkIsolateFuncKey = "_INSTANCEOF_ISOLATE_"
    vars                : string
    methods             : string
    methAnnots          : string
    mirrorVars          : string
    mirrorMethods       : string
    mirrorMethAnnots    : string
    constructor(vars : string,methods : string,methAnnots : string,mirrorVars : string,mirrorMethods : string,mirrorMethAnnots: string){
        super(ValueContainer.isolateType)
        this.vars               = vars
        this.methods            = methods
        this.methAnnots         = methAnnots
        this.mirrorVars         = mirrorVars
        this.mirrorMethods      = mirrorMethods
        this.mirrorMethAnnots   = mirrorMethAnnots
    }
}

export class SpiderObjectMirrorDefinitionContainer extends ValueContainer{
    definitions : Array<string>
    scopes      : Array<ValueContainer>
    methodAnnot : Array<ValueContainer>

    constructor(definitions : Array<string>,scopes : Array<ValueContainer>,methodAnnotations : Array<ValueContainer>){
        super(ValueContainer.objectMirrorDef)
        this.definitions    = definitions
        this.scopes         = scopes
        this.methodAnnot    = methodAnnotations
    }
}

export class SpiderIsolateMirrorDefinitionContainer extends ValueContainer{
    definitions : Array<string>
    scopes      : Array<ValueContainer>
    methodAnnot : Array<ValueContainer>

    constructor(definitions : Array<string>,scopes : Array<ValueContainer>,methodAnnotations : Array<ValueContainer>){
        super(ValueContainer.isolMirrorDef)
        this.definitions    = definitions
        this.scopes         = scopes
        this.methodAnnot    = methodAnnotations
    }
}
export class ClassDefinitionContainer extends ValueContainer{
    definitions : Array<string>
    scopes      : Array<ValueContainer>
    methodAnnot : Array<ValueContainer>

    constructor(definitions : Array<string>,scopes : Array<ValueContainer>,methodAnnotations : Array<ValueContainer>){
        super(ValueContainer.classDefType)
        this.definitions    = definitions
        this.scopes         = scopes
        this.methodAnnot    = methodAnnotations
    }
}
export class RepliqContainer extends ValueContainer{
    primitiveFields             : string
    objectFields                : string
    innerRepFields              : string
    innerName                   : string
    methods                     : string
    atomicMethods               : string
    repliqId                    : string
    masterOwnerId               : string
    isClient                    : boolean
    ownerAddress                : string
    ownerPort                   : number
    lastConfirmedRound          : number
    static checkRepliqFuncKey   : string = "_INSTANCEOF_REPLIQ_"

    constructor(primitiveFields : string,objectFields : string,innerRepFields : string,methods : string,atomicMethods : string,repliqId : string,masterOwnerId : string,isClient : boolean,ownerAddress : string,ownerPort : number,lastConfirmedRound : number, innerName = ""){
        super(ValueContainer.repliqType)
        this.primitiveFields    = primitiveFields
        this.objectFields       = objectFields
        this.innerRepFields     = innerRepFields
        this.innerName          = innerName
        this.methods            = methods
        this.atomicMethods      = atomicMethods
        this.repliqId           = repliqId
        this.masterOwnerId      = masterOwnerId
        this.isClient           = isClient
        this.ownerAddress       = ownerAddress
        this.ownerPort          = ownerPort
        this.lastConfirmedRound = lastConfirmedRound
    }
}

class RepliqFieldContainer extends ValueContainer{
    name        : string
    tentative   : any
    commited    : any
    readFunc    : string
    writeFunc   : string
    resetFunc   : string
    commitFunc  : string
    updateFunc  : string

    constructor(name : string,tentative : any,commited : any,readFunc : string,writeFunc : string,resetFunc : string,commitFunc : string,updateFunc : string){
        super(ValueContainer.repliqFieldType)
        this.name       = name
        this.tentative  = tentative
        this.commited   = commited
        this.readFunc   = readFunc
        this.writeFunc  = writeFunc
        this.resetFunc  = resetFunc
        this.commitFunc = commitFunc
        this.updateFunc = updateFunc
    }
}

export class RepliqDefinitionContainer extends ValueContainer{
    definition : string
    constructor(definition : string){
        super(ValueContainer.repliqDefinition)
        this.definition = definition
    }
}

//When a signal is serialised and passed to another actor it can implicitly only depend on the original signal
//From the moment the signal is deserialised on the receiving side it will act as a source for that actor
//Hence, all the information needed is the signal's id and its current value
export class SignalContainer extends ValueContainer{
    id                             : string
    obectValue                     : boolean
    currentValue                   : any
    rateLowerBound                 : number
    rateUpperBound                 : number
    clock                          : number
    strong                         : boolean
    ownerId                        : string
    ownerAddress                   : string
    ownerPort                      : number
    static checkSignalFuncKey      : string = "_INSTANCEOF_Signal_"

    constructor(id,objectValue,currentValue,rateLowerBound,rateUpperBound,clock,strong,ownerId,ownerAddress,ownerPort){
        super(ValueContainer.signalType)
        this.id             = id
        this.obectValue     = objectValue
        this.currentValue   = currentValue
        this.rateLowerBound = rateLowerBound
        this.rateUpperBound = rateUpperBound
        this.clock          = clock
        this.strong         = strong
        this.ownerId        = ownerId
        this.ownerAddress   = ownerAddress
        this.ownerPort      = ownerPort
    }
}

export class SignalDefinitionContainer extends ValueContainer{
    definition : string
    mutators   : Array<string>

    constructor(definition : string,mutators : Array<string>){
        super(ValueContainer.signalDefinition)
        this.definition = definition
        this.mutators   = mutators
    }
}

export class MapContainer extends ValueContainer{
    keys    : string
    values  : string

    constructor(keys : string,values : string){
        super(ValueContainer.mapType)
        this.keys   = keys
        this.values = values
    }
}

function isClass(func : Function) : boolean{
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}

function isXClass(func,className : string) : boolean{
    let regex = new RegExp("extends.*?"+className)
    if(func.toString().search(regex) != -1){
        return true
    }
    //Reached the end of class prototype chain
    else if((Reflect.ownKeys(func) as any).includes("apply")){
        return false
    }
    else{
        return isXClass(Reflect.getPrototypeOf(func),className)
    }
}

function isSpiderObjectClass(func : Function) : boolean {
    return isXClass(func,"SpiderObject")
}

function isSpiderIsolateClass(func: Function) : boolean{
    return isXClass(func,"SpiderIsolate")
}

function isObjectMirrorClass(func : Function) : boolean{
    return isXClass(func,"SpiderObjectMirror")
}

function isIsolateMirrorClass(func : Function) : boolean{
    return isXClass(func,"SpiderIsolateMirror")
}

function isRepliqClass(func : Function) : boolean{
    return isXClass(func,"Repliq")
}

function isSignalClass(func: Function) : boolean {
    return isXClass(func,"Signal")
}

function serialisePromise(promise,receiverId : string,enviroment : ActorEnvironment){
    var wrapper : PromiseAllocation = enviroment.promisePool.newPromise()
    promise.then((val) => {
        enviroment.commMedium.sendMessage(receiverId,new ResolvePromiseMessage(enviroment.thisRef,wrapper.promiseId,serialise(val,receiverId,enviroment),true))
    })
    promise.catch((reason) => {
        enviroment.commMedium.sendMessage(receiverId,new RejectPromiseMessage(enviroment.thisRef,wrapper.promiseId,serialise(reason,receiverId,enviroment),true))
    })
    return new PromiseContainer(wrapper.promiseId,enviroment.thisRef.ownerId)
}

function serialiseObject(object : Object,thisRef : FarReference,objectPool : ObjectPool) : ValueContainer{
    var oId                         = objectPool.allocateObject(object)
    let [fieldNames,methodNames]    = getObjectNames(object,"toString")
    if(thisRef instanceof ServerFarReference){
        return new ServerFarRefContainer(oId,fieldNames,methodNames,thisRef.ownerId,thisRef.ownerAddress,thisRef.ownerPort)
    }
    else{
        var clientRef = thisRef as ClientFarReference
        return new ClientFarRefContainer(oId,fieldNames,methodNames,clientRef.ownerId,clientRef.mainId,clientRef.contactId,clientRef.contactAddress,clientRef.contactPort)
    }
}

function serialiseMap(map : Map<any,any>,receiverId : string,environment : ActorEnvironment) : MapContainer{
    let keys    = []
    let values  = []
    map.forEach((value,key)=>{
        keys.push(serialise(key,receiverId,environment))
        values.push(serialise(value,receiverId,environment))
    })
    return new MapContainer(JSON.stringify(keys),JSON.stringify(values))
}

export function serialise(value,receiverId : string,environment : ActorEnvironment) : ValueContainer{
    if(typeof value == 'object'){
        if(value == null){
            return new NativeContainer(null)
        }
        else if(value instanceof Buffer){
            return new NativeContainer(value)
        }
        else if(value instanceof Promise){
            return serialisePromise(value,receiverId,environment)
        }
        else if(value instanceof Error){
            return new ErrorContainer(value)
        }
        else if(value instanceof Map){
            return serialiseMap(value,receiverId,environment)
        }
        else if(value[FarReference.ServerProxyTypeKey]){
            var farRef : ServerFarReference = value[FarReference.farRefAccessorKey]
            return new ServerFarRefContainer(farRef.objectId,farRef.objectFields,farRef.objectMethods,farRef.ownerId,farRef.ownerAddress,farRef.ownerPort)
        }
        else if(value[FarReference.ClientProxyTypeKey]){
            let farRef : ClientFarReference = value[FarReference.farRefAccessorKey]
            if(environment.thisRef instanceof ServerFarReference && farRef.contactId == null){
                //Current actor is a server and is the first to obtain a reference to this client actor. conversation with this client should now be rooted through this actor given that it has a socket reference to it
                return new ClientFarRefContainer(farRef.objectId,farRef.objectFields,farRef.objectMethods,farRef.ownerId,farRef.mainId,environment.thisRef.ownerId,environment.thisRef.ownerAddress,environment.thisRef.ownerPort)
            }
            else{
                return new ClientFarRefContainer(farRef.objectId,farRef.objectFields,farRef.objectMethods,farRef.ownerId,farRef.mainId,farRef.contactId,farRef.contactAddress,farRef.contactPort)
            }
        }
        else if(value instanceof Array){
            var values : Array<ValueContainer> = value.map((val) => {
                return serialise(val,receiverId,environment)
            })
            return new ArrayContainer(values)
        }
        else if(value[SpiderIsolateContainer.checkIsolateFuncKey]){
            let mirror                              = value[SpiderObjectMirror.mirrorAccessKey]
            let baseOb                              = mirror.pass(environment.actorMirror)
            let proxyBase                           = mirror.proxyBase
            //Remove base reference from mirror to avoid serialising the base object twice
            delete mirror.base
            delete baseOb[SpiderObjectMirror.mirrorAccessKey]
            delete mirror.proxyBase
            let [vars,methods,methodAnnots]         = deconstructBehaviour(baseOb,0,[],[],[],receiverId,environment,"toString")
            let [mVars,mMethods,mMethodAnnots]      = deconstructBehaviour(mirror,0,[],[],[],receiverId,environment,"toString")
            let container                           = new SpiderIsolateContainer(JSON.stringify(vars),JSON.stringify(methods),JSON.stringify(methodAnnots),JSON.stringify(mVars),JSON.stringify(mMethods),JSON.stringify(mMethodAnnots))
            //Reset base object <=> mirror link
            mirror.base                             = baseOb
            mirror.proxyBase                        = proxyBase
            baseOb[SpiderObjectMirror.mirrorAccessKey] = mirror
            return container
        }
        else if(value[SpiderObject.spiderObjectKey]){
            let objectMirror : SpiderObjectMirror = value[SpiderObjectMirror.mirrorAccessKey]
            return serialise(objectMirror.pass(environment.actorMirror),receiverId,environment)
        }
        else {
            return serialiseObject(value,environment.thisRef,environment.objectPool)
        }
    }
    else if(typeof value == 'function'){
        //Value is actualy not a function but the result of a field access on a proxy (which is technically a function, see farRef)
        if(value[FarReference.proxyWrapperAccessorKey]){
            return serialisePromise(value,receiverId,environment)
        }
        else if(isClass(value) && isObjectMirrorClass(value)){
            let chain : ClassDefinitionChain = getClassDefinitionChain(value)
            let scopes    = chain.classScopes.map((scope : LexScope)=>{
                if(scope){
                    return scope.scopeObjects
                }
                else{
                    return scope
                }
            })
            let serScopes : Array<ValueContainer>  = scopes.map((scope)=>{return serialise(scope,receiverId,environment)})
            let serAnnot  : Array<ValueContainer>   = chain.methodAnnotations.map((annots)=>{return serialise(annots,receiverId,environment)})
            return new SpiderObjectMirrorDefinitionContainer(chain.serialisedClass,serScopes,serAnnot)
        }
        else if(isClass(value) && isIsolateMirrorClass(value)){
            let chain : ClassDefinitionChain = getClassDefinitionChain(value)
            let scopes    = chain.classScopes.map((scope : LexScope)=>{
                if(scope){
                    return scope.scopeObjects
                }
                else{
                    return scope
                }
            })
            let serScopes : Array<ValueContainer>  = scopes.map((scope)=>{return serialise(scope,receiverId,environment)})
            let serAnnot  : Array<ValueContainer>   = chain.methodAnnotations.map((annots)=>{return serialise(annots,receiverId,environment)})
            return new SpiderIsolateMirrorDefinitionContainer(chain.serialisedClass,serScopes,serAnnot)
        }
        else if(isClass(value) && isSpiderObjectClass(value)){
            let chain : ClassDefinitionChain        = getClassDefinitionChain(value)
            let scopes                              = chain.classScopes.map((scope : LexScope)=>{
                if(scope){
                    return scope.scopeObjects
                }
                else{
                    return scope
                }
            })
            let serScopes : Array<ValueContainer>   = scopes.map((scope)=>{return serialise(scope,receiverId,environment)})
            let serAnnot  : Array<ValueContainer>   = chain.methodAnnotations.map((annots)=>{return serialise(annots,receiverId,environment)})
            return new SpiderObjectDefinitionContainer(chain.serialisedClass,serScopes,serAnnot)
        }
        else if(isClass(value) && isSpiderIsolateClass(value)){
            let chain : ClassDefinitionChain       = getClassDefinitionChain(value)
            let scopes    = chain.classScopes.map((scope : LexScope)=>{
                if(scope){
                    return scope.scopeObjects
                }
                else{
                    return scope
                }
            })
            let serScopes : Array<ValueContainer>  = scopes.map((scope)=>{
                return serialise(scope,receiverId,environment)
            })
            let serAnnot  : Array<ValueContainer>   = chain.methodAnnotations.map((annots)=>{return serialise(annots,receiverId,environment)})
            return new SpiderIsolateDefinitionContainer(chain.serialisedClass,serScopes,serAnnot)
        }
        else if(isClass(value)){
            let chain : ClassDefinitionChain = getClassDefinitionChain(value,false)
            let scopes    = chain.classScopes.map((scope : LexScope)=>{
                if(scope){
                    return scope.scopeObjects
                }
                else{
                    return scope
                }
            })
            let serScopes : Array<ValueContainer>  = scopes.map((scope)=>{return serialise(scope,receiverId,environment)})
            let serAnnot  : Array<ValueContainer>   = chain.methodAnnotations.map((annots)=>{return serialise(annots,receiverId,environment)})
            return new ClassDefinitionContainer(chain.serialisedClass,serScopes,serAnnot)
        }
        else{
            throw new Error("Serialisation of functions disallowed: " + value.toString())
        }
    }
    else {
        return new NativeContainer(value)
    }
}

export function deserialise(value : ValueContainer,environment : ActorEnvironment) : any{
    function deSerialisePromise(promiseContainer : PromiseContainer){
        return environment.promisePool.newForeignPromise(promiseContainer.promiseId,promiseContainer.promiseCreatorId)
    }

    function deSerialiseServerFarRef(farRefContainer : ServerFarRefContainer){
        var farRef = new ServerFarReference(farRefContainer.objectId,farRefContainer.objectFields,farRefContainer.objectMethods,farRefContainer.ownerId,farRefContainer.ownerAddress,farRefContainer.ownerPort,environment)
        if(environment.thisRef instanceof ServerFarReference){
            if(!(environment.commMedium.hasConnection(farRef.ownerId))){
                environment.commMedium.openConnection(farRef.ownerId,farRef.ownerAddress,farRef.ownerPort)
            }
        }
        else{
            if(!(environment.commMedium.hasConnection(farRef.ownerId))){
                environment.commMedium.connectTransientRemote(environment.thisRef,farRef,environment.promisePool)
            }
        }
        return farRef.proxify()
    }

    function deSerialiseClientFarRef(farRefContainer : ClientFarRefContainer){
        var farRef : ClientFarReference
        if((environment.thisRef instanceof  ServerFarReference) && farRefContainer.contactId == null){
            //This is the first server side actor to come into contact with this client-side far reference and will henceforth be the contact point for all messages sent to this far reference
            farRef = new ClientFarReference(farRefContainer.objectId,farRefContainer.objectFields,farRefContainer.objectMethods,farRefContainer.ownerId,farRefContainer.mainId,environment,environment.thisRef.ownerId,environment.thisRef.ownerAddress,environment.thisRef.ownerPort)
        }
        else{
            farRef = new ClientFarReference(farRefContainer.objectId,farRefContainer.objectFields,farRefContainer.objectMethods,farRefContainer.ownerId,farRefContainer.mainId,environment,farRefContainer.contactId,farRefContainer.contactAddress,farRefContainer.contactPort)
        }
        return farRef.proxify()
    }

    function deSerialiseError(errorContainer : ErrorContainer){
        var error   = new Error(errorContainer.message)
        error.stack = errorContainer.stack
        error.name  = errorContainer.name
        return error
    }

    function deSerialiseArray(arrayContainer : ArrayContainer){
        var deserialised = arrayContainer.values.map((valCont) => {
            return deserialise(valCont,environment)
        })
        return deserialised
    }

    function deSerialiseSpiderObjectDefinition(def : SpiderObjectDefinitionContainer){
        let scopes      = def.scopes.map((scope)=>{
            return deserialise(scope,environment)
        })
        let methAnnots  = def.methodAnnot.map((annots)=>{
            return deserialise(annots,environment)
        })
        methAnnots.forEach((annots : Map<string,Array<string>>)=>{
            annots.forEach(([annotFunc,annotTag],methName : string)=>{
                annots.set(methName,[constructMethod(annotFunc),annotTag])
            })
        })
        return reconstructClassDefinitionChain(def.definitions,scopes,methAnnots,require("./MOP").SpiderObject,require("./MOP").reCreateObjectClass)
    }

    function deSerialiseSpiderIsolateDefinition(def : SpiderIsolateDefinitionContainer){
        let scopes = def.scopes.map((scope)=>{
            return deserialise(scope,environment)
        })
        let methAnnots  = def.methodAnnot.map((annots)=>{
            return deserialise(annots,environment)
        })
        methAnnots.forEach((annots : Map<string,Array<string>>)=>{
            annots.forEach(([annotFunc,annotTag],methName : string)=>{
                annots.set(methName,[constructMethod(annotFunc),annotTag])
            })
        })
        return reconstructClassDefinitionChain(def.definitions,scopes,methAnnots,require("./MOP").SpiderIsolate,require("./MOP").reCreateIsolateClass)
    }

    function deSerialiseSpiderIsolate(isolateContainer : SpiderIsolateContainer){
        var isolate     = reconstructBehaviour({},JSON.parse(isolateContainer.vars),JSON.parse(isolateContainer.methods),JSON.parse(isolateContainer.methAnnots),environment)
        var isolClone   = reconstructBehaviour({},JSON.parse(isolateContainer.vars),JSON.parse(isolateContainer.methods),JSON.parse(isolateContainer.methAnnots),environment)
        var mirror      = reconstructBehaviour({},JSON.parse(isolateContainer.mirrorVars),JSON.parse(isolateContainer.mirrorMethods),JSON.parse(isolateContainer.mirrorMethAnnots),environment)
        isolate.instantiate(mirror,isolClone,wrapPrototypes,makeSpiderObjectProxy,simpleBind)
        //There's an edge case where an actor mirror contains an isolate, when the mirror is deserialised by the ActorProto (i.e. upon creation) the environment is not created yet (ugly but needed)
        if(environment){
            return mirror.resolve(environment.actorMirror)
        }
        else{
            return mirror.resolve()
        }
    }

    function deSerialiseSpiderObjectMirrorDefintion(def : SpiderObjectMirrorDefinitionContainer){
        let scopes = def.scopes.map((scope)=>{
            return deserialise(scope,environment)
        })
        let methAnnots  = def.methodAnnot.map((annots)=>{
            return deserialise(annots,environment)
        })
        methAnnots.forEach((annots : Map<string,Array<string>>)=>{
            annots.forEach(([annotFunc,annotTag],methName : string)=>{
                annots.set(methName,[constructMethod(annotFunc),annotTag])
            })
        })
        return reconstructClassDefinitionChain(def.definitions,scopes,methAnnots,require("./MOP").SpiderObjectMirror,require("./MOP").reCreateObjectMirrorClass)
    }

    function deSerialiseSpiderIsolateMirrorDefinition(def : SpiderIsolateMirrorDefinitionContainer){
        let scopes = def.scopes.map((scope)=>{
            return deserialise(scope,environment)
        })
        let methAnnots  = def.methodAnnot.map((annots)=>{
            return deserialise(annots,environment)
        })
        methAnnots.forEach((annots : Map<string,Array<string>>)=>{
            annots.forEach(([annotFunc,annotTag],methName : string)=>{
                annots.set(methName,[constructMethod(annotFunc),annotTag])
            })
        })
        return reconstructClassDefinitionChain(def.definitions,scopes,methAnnots,require("./MOP").SpiderIsolateMirror,require("./MOP").reCreateIsolateMirrorClass)
    }

    function deSerialiseClassDefinition(def : ClassDefinitionContainer){
        function reCreateClass(classDefinition,scope : Map<string,any>,superClass){
            if(superClass != null){
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
        let scopes = def.scopes.map((scope)=>{
            return deserialise(scope,environment)
        })
        let methAnnots  = def.methodAnnot.map((annots)=>{
            return deserialise(annots,environment)
        })
        methAnnots.forEach((annots : Map<string,Array<string>>)=>{
            annots.forEach(([annotFunc,annotTag],methName : string)=>{
                annots.set(methName,[constructMethod(annotFunc),annotTag])
            })
        })
        return reconstructClassDefinitionChain(def.definitions,scopes,methAnnots,null,reCreateClass)
    }

    function deSerialiseMap(mapContainer : MapContainer){
        let keys    = JSON.parse(mapContainer.keys).map((key)=>{
            return deserialise(key,environment)
        })
        let vals    = JSON.parse(mapContainer.values).map((val)=>{
            return deserialise(val,environment)
        })
        let m       = new Map()
        keys.forEach((key,index)=>{
            m.set(key,vals[index])
        })
        return m
    }
    switch(value.type){
        case ValueContainer.nativeType :
            return (value as NativeContainer).value
        case ValueContainer.promiseType:
            return deSerialisePromise(value as PromiseContainer)
        case ValueContainer.clientFarRefType:
            return deSerialiseClientFarRef(value as ClientFarRefContainer)
        case ValueContainer.serverFarRefType:
            return deSerialiseServerFarRef(value as ServerFarRefContainer)
        case ValueContainer.errorType:
            return deSerialiseError(value as ErrorContainer)
        case ValueContainer.arrayType:
            return deSerialiseArray(value as ArrayContainer)
        case ValueContainer.spiderObjectDef:
            return deSerialiseSpiderObjectDefinition(value as SpiderObjectDefinitionContainer)
        case ValueContainer.objectMirrorDef:
            return deSerialiseSpiderObjectMirrorDefintion(value as SpiderObjectMirrorDefinitionContainer)
        case ValueContainer.spiderIsolDef:
            return deSerialiseSpiderIsolateDefinition(value as SpiderIsolateDefinitionContainer)
        case ValueContainer.isolateType:
            return deSerialiseSpiderIsolate(value as SpiderIsolateContainer)
        case ValueContainer.isolMirrorDef:
            return deSerialiseSpiderIsolateMirrorDefinition(value as SpiderIsolateMirrorDefinitionContainer)
        case ValueContainer.classDefType:
            return deSerialiseClassDefinition(value as ClassDefinitionContainer)
        case ValueContainer.mapType:
            return deSerialiseMap(value as MapContainer)
        default :
            console.log(value)
            throw "Unknown value container type :  " + value.type
    }
}