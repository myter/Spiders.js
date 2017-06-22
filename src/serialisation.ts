///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>


import {PromisePool, PromiseAllocation} from "./PromisePool";
import {ResolvePromiseMessage, RejectPromiseMessage, RegisterExternalSignalMessage} from "./messages";
import {ObjectPool} from "./objectPool";
import {ServerFarReference, FarReference, ClientFarReference} from "./farRef";
import {CommMedium} from "./commMedium";
import {ArrayIsolate, Isolate} from "./spiders";
import {Repliq} from "./Replication/Repliq";
import {RepliqPrimitiveField} from "./Replication/RepliqPrimitiveField";
import {GSP} from "./Replication/GSP";
import {RepliqField} from "./Replication/RepliqField";
import {RepliqObjectField} from "./Replication/RepliqObjectField";
import {Signal} from "./Reactivivity/signal";
import {SignalPool} from "./Reactivivity/signalPool";
/**
 * Created by flo on 19/12/2016.
 */

//Enables to detect true type of instances (e.g. array)
function toType(obj : any) : string {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}


export function getObjectVars(object : Object,thisRef : FarReference,receiverId : string,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool) : Array<any>{
    var vars        = []
    var properties  = Reflect.ownKeys(object)
    for(var i in properties){
        var key             = properties[i]
        var val             = Reflect.get(object,key)
        var serialisedval   = serialise(val,thisRef,receiverId,commMedium,promisePool,objectPool)
        vars.push([key,serialisedval])
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

export function deconstructStatic(actorClass,thisRef : FarReference,receiverId : string,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool,results : Array<any>){
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
                    thisVars.push([key,serialise(property,thisRef,receiverId,commMedium,promisePool,objectPool)])
                }
            }
        })
        results.push([thisName,thisVars,thisMethods])
        return deconstructStatic(actorClass.__proto__,thisRef,receiverId,commMedium,promisePool,objectPool,results)
    }
}

function constructMethod(functionSource){
    if(functionSource.startsWith("function")){
        var method =  eval( "(" +  functionSource +")" )
    }
    else{
        var method =  eval("(function " + functionSource + ")" )
    }
    return method
}

export function reconstructStatic(behaviourObject : Object,staticProperties : Array<any>,thisRef : FarReference,promisePool : PromisePool,commMedium : CommMedium,objectPool : ObjectPool,gspInstance : GSP,signalPool : SignalPool){
    staticProperties.forEach((propertyArray : Array<any>)=>{
        var className   = propertyArray[0]
        var stub        = {}
        var vars        = propertyArray[1]
        var methods     = propertyArray[2]
        vars.forEach((varPair : Array<any>)=>{
            var key     = varPair[0]
            var val     = deserialise(thisRef,varPair[1],promisePool,commMedium,objectPool,gspInstance,signalPool)
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

export function deconstructBehaviour(object : any,currentLevel : number,accumVars : Array<any>,accumMethods : Array<any>,thisRef : FarReference,receiverId : string,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool){
    var properties          = Reflect.ownKeys(object)
    var localAccumVars      = []
    for(var i in properties){
        var key             = properties[i]
        var val             = Reflect.get(object,key)
        if(typeof val != 'function' || isIsolateClass(val) || isRepliqClass(val)){
            var serialisedval   = serialise(val,thisRef,receiverId,commMedium,promisePool,objectPool)
            localAccumVars.push([key,serialisedval])
        }
    }
    localAccumVars.unshift(currentLevel)
    accumVars.push(localAccumVars)
    var localAccumMethods   = []
    var proto               = object.__proto__
    properties              = Reflect.ownKeys(proto)
    properties.shift()
    var lastProto           = properties.indexOf("spawn") != -1
    if(!lastProto){
        for(var i in properties){
            var key     = properties[i]
            var method  = Reflect.get(proto,key)
            if(typeof method == 'function'){
                localAccumMethods.push([key,method.toString()])
            }
        }
        localAccumMethods.unshift(currentLevel + 1)
        accumMethods.push(localAccumMethods)
        return deconstructBehaviour(proto,currentLevel + 1,accumVars,accumMethods,thisRef,receiverId,commMedium,promisePool,objectPool)
    }
    else{
        return [accumVars,accumMethods]
    }
}

export function reconstructBehaviour(baseObject : any,variables :Array<any>, methods : Array<any>,thisRef : FarReference,promisePool : PromisePool,commMedium : CommMedium,objectPool : ObjectPool,gspInstance : GSP,signalPool : SignalPool) {
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
            var val             = deserialise(thisRef,rawVal,promisePool,commMedium,objectPool,gspInstance,signalPool)
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
    return baseObject
}


function getProtoForLevel(level,object){
    var ret = object
    for(var i = 0;i < level;i++){
        ret = ret.__proto__
    }
    return ret
}

export function reconstructObject(baseObject : any,variables :Array<any>, methods : Array<any>,thisRef : FarReference,promisePool : PromisePool,commMedium : CommMedium,objectPool : ObjectPool,gspInstance : GSP,signalPool : SignalPool) {
    variables.forEach((varEntry) => {
        var key             = varEntry[0]
        var rawVal          = varEntry[1]
        var val             = deserialise(thisRef,rawVal,promisePool,commMedium,objectPool,gspInstance,signalPool)
        baseObject[key]      = val
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
    static arrayIsolateType     : number = 8
    static repliqType           : number = 9
    static repliqFieldType      : number = 10
    static repliqDefinition     : number = 11
    static signalType           : number = 12
    type                        : number

    constructor(type : number){
        this.type = type
    }
}

type NativeValue =  number | boolean | string | null
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
    ownerId         : string
    ownerAddress    : string
    ownerPort       : number
    constructor(objectId : number,ownerId : string,ownerAddress : string,ownerPort : number){
        super(ValueContainer.serverFarRefType)
        this.objectId       = objectId
        this.ownerId        = ownerId
        this.ownerAddress   = ownerAddress
        this.ownerPort      = ownerPort
    }
}

export class ClientFarRefContainer extends ValueContainer{
    objectId        : number
    ownerId         : string
    mainId          : string
    contactId       : string
    contactAddress  : string
    contactPort     : number

    constructor(objectId : number,ownerId : string,mainId : string,contactId : string,contactAddress : string, contactPort : number){
        super(ValueContainer.clientFarRefType)
        this.objectId       = objectId
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

export class IsolateContainer extends ValueContainer{
    vars                            : string
    methods                         : string
    static checkIsolateFuncKey      : string = "_INSTANCEOF_ISOLATE_"
    constructor(vars : string,methods : string){
        super(ValueContainer.isolateType)
        this.vars       = vars
        this.methods    = methods
    }
}

export class IsolateDefinitionContainer extends ValueContainer{
    definition : string
    constructor(definition : string){
        super(ValueContainer.isolateDefType)
        this.definition = definition
    }
}

export class ArrayIsolateContainer extends ValueContainer{
    array                           : Array<any>
    static checkArrayIsolateFuncKey : string = "_INSTANCEOF_ARRAY_ISOLATE_"
    constructor(array : Array<any>){
        super(ValueContainer.arrayIsolateType)
        this.array = array
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
    static checkRepliqFuncKey   : string = "_INSTANCEOF_REPLIQ_"

    constructor(primitiveFields : string,objectFields : string,innerRepFields : string,methods : string,atomicMethods : string,repliqId : string,masterOwnerId : string,isClient : boolean,ownerAddress : string,ownerPort : number,innerName = ""){
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
    currentValue                   : any
    ownerId                        : string
    ownerAddress                   : string
    ownerPort                      : number
    static checkSignalFuncKey      : string = "_INSTANCEOF_Signal_"

    constructor(id,currentValue,ownerId,ownerAddress,ownerPort){
        super(ValueContainer.signalType)
        this.id             = id
        this.currentValue   = currentValue
        this.ownerId        = ownerId
        this.ownerAddress   = ownerAddress
        this.ownerPort      = ownerPort
    }
}

function isClass(func : Function) : boolean{
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}

function isIsolateClass(func : Function) : boolean {
    return (func.toString().search(/extends.*?Isolate/) != -1)
}

function isRepliqClass(func : Function) : boolean{
    return (func.toString().search(/extends.*?Repliq/) != -1)
}

function serialisePromise(promise,thisRef : FarReference,receiverId : string,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool){
    var wrapper : PromiseAllocation = promisePool.newPromise()
    promise.then((val) => {
        commMedium.sendMessage(receiverId,new ResolvePromiseMessage(thisRef,wrapper.promiseId,serialise(val,thisRef,receiverId,commMedium,promisePool,objectPool),true))
    })
    promise.catch((reason) => {
        commMedium.sendMessage(receiverId,new RejectPromiseMessage(thisRef,wrapper.promiseId,serialise(reason,thisRef,receiverId,commMedium,promisePool,objectPool),true))
    })
    return new PromiseContainer(wrapper.promiseId,thisRef.ownerId)
}

function serialiseObject(object : Object,thisRef : FarReference,objectPool : ObjectPool) : ValueContainer{
    var oId = objectPool.allocateObject(object)
    if(thisRef instanceof ServerFarReference){
        return new ServerFarRefContainer(oId,thisRef.ownerId,thisRef.ownerAddress,thisRef.ownerPort)
    }
    else{
        var clientRef = thisRef as ClientFarReference
        return new ClientFarRefContainer(oId,clientRef.ownerId,clientRef.mainId,clientRef.contactId,clientRef.contactAddress,clientRef.contactPort)
    }
}

function serialiseRepliqFields(fields : Map<string,RepliqField<any>>,thisRef : FarReference,receiverId : string,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool){
    let primitives = []
    let objects    = []
    let innerReps  = []
    let ret        = [primitives,objects,innerReps]
    fields.forEach((repliqField : RepliqField<any>,fieldName)=>{
        if(repliqField instanceof RepliqPrimitiveField){
            primitives.push(new RepliqFieldContainer(fieldName,repliqField.tentative,repliqField.commited,repliqField.read.toString(),repliqField.writeField.toString(),repliqField.resetToCommit.toString(),repliqField.commit.toString(),repliqField.update.toString()))
        }
        else if(repliqField instanceof RepliqObjectField){
            let field       = repliqField as RepliqObjectField
            let tentMethods
            let commMethods
            //Avoid copying over Object prototype methods containing native javascript code (cannot be evalled by deserialiser)
            if(Object.getPrototypeOf(field.tentative) == Object.getPrototypeOf({})){
                tentMethods = []
                commMethods = []
            }
            else{
                tentMethods = getObjectMethods(field.tentative)
                commMethods = getObjectMethods(field.commited)
            }
            let tentative   = JSON.stringify([JSON.stringify(getObjectVars(field.tentative,thisRef,receiverId,commMedium,promisePool,objectPool)),JSON.stringify(tentMethods)])
            let commited    = JSON.stringify([JSON.stringify(getObjectVars(field.commited,thisRef,receiverId,commMedium,promisePool,objectPool)),JSON.stringify(commMethods)])
            objects.push(new RepliqFieldContainer(fieldName,tentative,commited,field.read.toString(),field.writeField.toString(),field.resetToCommit.toString(),field.commit.toString(),field.update.toString()))
        }
        else if(repliqField[RepliqContainer.checkRepliqFuncKey]){
            innerReps.push(serialiseRepliq(repliqField,thisRef,receiverId,commMedium,promisePool,objectPool,fieldName))
        }
        else{
            throw new Error("Unknown Repliq field type in serialisation")
        }
    })
    return ret
}

function serialiseRepliq(repliqProxy,thisRef : FarReference,receiverId : string,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool,innerName = "") : RepliqContainer{
    let fields          = repliqProxy[Repliq.getRepliqFields]
    let fieldsArr       = serialiseRepliqFields(fields,thisRef,receiverId,commMedium,promisePool,objectPool)
    let primitiveFields = fieldsArr[0]
    let objectFields    = fieldsArr[1]
    let innerReps       = fieldsArr[2]
    let methods         = repliqProxy[Repliq.getRepliqOriginalMethods]
    let methodArr       = []
    let atomicArr       = []
    methods.forEach((method,methodName)=>{
        if(method[Repliq.isAtomic]){
            atomicArr.push([methodName,method.toString()])
        }
        else{
            methodArr.push([methodName,method.toString()])
        }
    })
    let repliqId        = repliqProxy[Repliq.getRepliqID]
    let repliqOwnerId   = repliqProxy[Repliq.getRepliqOwnerID]
    let isClient        = repliqProxy[Repliq.isClientMaster]
    let ownerAddress    = repliqProxy[Repliq.getRepliqOwnerAddress]
    let ownerPort       = repliqProxy[Repliq.getRepliqOwnerPort]
    let ret             = new RepliqContainer(JSON.stringify(primitiveFields),JSON.stringify(objectFields),JSON.stringify(innerReps),JSON.stringify(methodArr),JSON.stringify(atomicArr),repliqId,repliqOwnerId,isClient,ownerAddress,ownerPort,innerName)
    //This actor is the first to serialise this Repliq, set the address and port to this actor
    if(thisRef instanceof ServerFarReference && ret.ownerAddress == null){
        ret.ownerAddress = thisRef.ownerAddress
        ret.ownerPort    = thisRef.ownerPort
        ret.isClient     = false
    }
    else{
        //TODO
    }
    return ret
}

export function serialise(value,thisRef : FarReference,receiverId : string,commMedium : CommMedium,promisePool : PromisePool,objectPool : ObjectPool) : ValueContainer{
    if(typeof value == 'object'){
        if(value == null){
            return new NativeContainer(null)
        }
        else if(value instanceof Promise){
            return serialisePromise(value,thisRef,receiverId,commMedium,promisePool,objectPool)
        }
        else if(value instanceof Error){
            return new ErrorContainer(value)
        }
        else if(value[FarReference.ServerProxyTypeKey]){
            var farRef : ServerFarReference = value[FarReference.farRefAccessorKey]
            return new ServerFarRefContainer(farRef.objectId,farRef.ownerId,farRef.ownerAddress,farRef.ownerPort)
        }
        else if(value[FarReference.ClientProxyTypeKey]){
            let farRef : ClientFarReference = value[FarReference.farRefAccessorKey]
            if(thisRef instanceof ServerFarReference && farRef.contactId == null){
                //Current actor is a server and is the first to obtain a reference to this client actor. conversation with this client should now be rooted through this actor given that it has a socket reference to it
                return new ClientFarRefContainer(farRef.objectId,farRef.ownerId,farRef.mainId,thisRef.ownerId,thisRef.ownerAddress,thisRef.ownerPort)
            }
            else{
                return new ClientFarRefContainer(farRef.objectId,farRef.ownerId,farRef.mainId,farRef.contactId,farRef.contactAddress,farRef.contactPort)
            }
        }
        else if(value[ArrayIsolateContainer.checkArrayIsolateFuncKey]){
            return new ArrayIsolateContainer(value.array)
        }
        else if(value instanceof Array){
            var values : Array<ValueContainer> = value.map((val) => {
                return serialise(val,thisRef,receiverId,commMedium,promisePool,objectPool)
            })
            return new ArrayContainer(values)
        }
        else if(value[IsolateContainer.checkIsolateFuncKey]){
            var vars    = getObjectVars(value,thisRef,receiverId,commMedium,promisePool,objectPool)
            var methods = getObjectMethods(value)
            return new IsolateContainer(JSON.stringify(vars),JSON.stringify(methods))
        }
        else if(value[RepliqContainer.checkRepliqFuncKey]){
            return serialiseRepliq(value,thisRef,receiverId,commMedium,promisePool,objectPool)
        }
        else if(value[SignalContainer.checkSignalFuncKey]){
            let sig = value as Signal
            return new SignalContainer(sig.id,sig.currentVal,thisRef.ownerId,(thisRef as ServerFarReference).ownerAddress,(thisRef as ServerFarReference).ownerPort)
        }
        else {
            return serialiseObject(value,thisRef,objectPool)
        }
    }
    else if(typeof value == 'function'){
        //Value is actualy not a function but the result of a field access on a proxy (which is technically a function, see farRef)
        if(value[FarReference.proxyWrapperAccessorKey]){
            return serialisePromise(value,thisRef,receiverId,commMedium,promisePool,objectPool)
        }
        else if(isClass(value) && isIsolateClass(value)){
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/,'')
            return new IsolateDefinitionContainer(definition.replace("super()",''))
        }
        else if(isClass(value) && isRepliqClass(value)){
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/,'')
            return new RepliqDefinitionContainer(definition)
        }
        else if(isClass(value)){
            throw new Error("Serialisation of classes disallowed")
        }
        else{
            throw new Error("Serialisation of functions disallowed: " + value.toString())
        }
    }
    else {
        return new NativeContainer(value)
    }
}

export function deserialise(thisRef : FarReference,value : ValueContainer,promisePool : PromisePool,commMedium : CommMedium,objectPool : ObjectPool,gspInstance : GSP,signalPool : SignalPool) : any{
    function deSerialisePromise(promiseContainer : PromiseContainer){
        return promisePool.newForeignPromise(promiseContainer.promiseId,promiseContainer.promiseCreatorId)
    }


    function deSerialiseServerFarRef(farRefContainer : ServerFarRefContainer){
        var farRef = new ServerFarReference(farRefContainer.objectId,farRefContainer.ownerId,farRefContainer.ownerAddress,farRefContainer.ownerPort,thisRef,commMedium,promisePool,objectPool)
        if(thisRef instanceof ServerFarReference){
            if(!(commMedium.hasConnection(farRef.ownerId))){
                commMedium.openConnection(farRef.ownerId,farRef.ownerAddress,farRef.ownerPort)
            }
        }
        else{
            if(!(commMedium.hasConnection(farRef.ownerId))){
                commMedium.connectTransientRemote(thisRef,farRef,promisePool)
            }
        }
        return farRef.proxyify()
    }

    function deSerialiseClientFarRef(farRefContainer : ClientFarRefContainer){
        var farRef : ClientFarReference
        if((thisRef instanceof  ServerFarReference) && farRefContainer.contactId == null){
            //This is the first server side actor to come into contact with this client-side far reference and will henceforth be the contact point for all messages sent to this far reference
            farRef = new ClientFarReference(farRefContainer.objectId,farRefContainer.ownerId,farRefContainer.mainId,thisRef,commMedium,promisePool,objectPool,thisRef.ownerId,thisRef.ownerAddress,thisRef.ownerPort)
        }
        else{
            farRef = new ClientFarReference(farRefContainer.objectId,farRefContainer.ownerId,farRefContainer.mainId,thisRef,commMedium,promisePool,objectPool,farRefContainer.contactId,farRefContainer.contactAddress,farRefContainer.contactPort)
        }
        return farRef.proxyify()
    }

    function deSerialiseError(errorContainer : ErrorContainer){
        var error   = new Error(errorContainer.message)
        error.stack = errorContainer.stack
        error.name  = errorContainer.name
        return error
    }

    function deSerialiseArray(arrayContainer : ArrayContainer){
        var deserialised = arrayContainer.values.map((valCont) => {
            return deserialise(thisRef,valCont,promisePool,commMedium,objectPool,gspInstance,signalPool)
        })
        return deserialised
    }

    function deSerialiseIsolate(isolateContainer : IsolateContainer){
        var isolate = reconstructObject(new Isolate(),JSON.parse(isolateContainer.vars),JSON.parse(isolateContainer.methods),thisRef,promisePool,commMedium,objectPool,gspInstance,signalPool)
        return isolate
    }

    function deSerialiseIsolateDefinition(isolateDefContainer : IsolateDefinitionContainer){
        var classObj = eval(isolateDefContainer.definition)
        classObj.prototype[IsolateContainer.checkIsolateFuncKey] = true
        return classObj
    }

    function deSerialiseArrayIsolate(arrayIsolateContainer : ArrayIsolateContainer){
        return new ArrayIsolate(arrayIsolateContainer.array)
    }

    function deSerialiseRepliq(repliqContainer : RepliqContainer){
        let blankRepliq     = new Repliq()
        let fields          = new Map();
        (JSON.parse(repliqContainer.primitiveFields)).forEach((repliqField : RepliqFieldContainer)=>{
            let field                  = new RepliqPrimitiveField(repliqField.name,repliqField.tentative)
            field.commited             = repliqField.commited
            field.read                 = constructMethod(repliqField.readFunc)
            field.writeField           = constructMethod(repliqField.writeFunc)
            field.resetToCommit        = constructMethod(repliqField.resetFunc)
            field.commit               = constructMethod(repliqField.commitFunc)
            field.update               = constructMethod(repliqField.updateFunc)
            fields.set(field.name,field)
        });
        (JSON.parse(repliqContainer.objectFields)).forEach((repliqField : RepliqFieldContainer)=>{
            let tentParsed              = JSON.parse(repliqField.tentative)
            let comParsed               = JSON.parse(repliqField.commited)
            let tentBase                = {}
            Reflect.setPrototypeOf(tentBase,{})
            let comBase                 = {}
            Reflect.setPrototypeOf(comBase,{})
            let tentative               = reconstructObject(tentBase,JSON.parse(tentParsed[0]),JSON.parse(tentParsed[1]),thisRef,promisePool,commMedium,objectPool,gspInstance,signalPool)
            let commited                = reconstructObject(comBase,JSON.parse(comParsed[0]),JSON.parse(comParsed[1]),thisRef,promisePool,commMedium,objectPool,gspInstance,signalPool)
            let field                   = new RepliqObjectField(repliqField.name,{})
            field.tentative             = tentative
            field.commited              = commited
            field.read                  = constructMethod(repliqField.readFunc)
            field.writeField            = constructMethod(repliqField.writeFunc)
            field.resetToCommit         = constructMethod(repliqField.resetFunc)
            field.commit                = constructMethod(repliqField.commitFunc)
            field.update                = constructMethod(repliqField.updateFunc)
            fields.set(field.name,field)
        });
        (JSON.parse(repliqContainer.innerRepFields)).forEach((innerRepliq : RepliqContainer)=>{
            fields.set(innerRepliq.innerName,deserialise(thisRef,innerRepliq,promisePool,commMedium,objectPool,gspInstance,signalPool))
        })
        let methods         = new Map();
        (JSON.parse(repliqContainer.methods)).forEach(([methodName,methodSource])=>{
            methods.set(methodName,constructMethod(methodSource))
        })
        let atomicMethods   = new Map();
        (JSON.parse(repliqContainer.atomicMethods)).forEach(([methodName,methodSource])=>{
            atomicMethods.set(methodName,constructMethod(methodSource))
        })
        if(repliqContainer.isClient){
            //TODO
        }
        else{
            if(!commMedium.hasConnection(repliqContainer.masterOwnerId)){
                commMedium.openConnection(repliqContainer.masterOwnerId,repliqContainer.ownerAddress,repliqContainer.ownerPort)
            }
        }
        return blankRepliq.reconstruct(gspInstance,repliqContainer.repliqId,repliqContainer.masterOwnerId,fields,methods,atomicMethods,repliqContainer.isClient,repliqContainer.ownerAddress,repliqContainer.ownerPort)
    }

    function deSerialiseRepliqDefinition(def : RepliqDefinitionContainer){
        let index = def.definition.indexOf("{")
        let start = def.definition.substring(0,index)
        let stop = def.definition.substring(index,def.definition.length)
        let Repliq = require("./Replication/Repliq").Repliq
        var classObj = eval(start + " extends Repliq"+stop)
        return classObj
    }

    function deSerialiseSignal(sigContainer : SignalContainer){
        if(!commMedium.hasConnection(sigContainer.ownerId)){
            commMedium.openConnection(sigContainer.ownerId,sigContainer.ownerAddress,sigContainer.ownerPort)
        }
        let signalId    = sigContainer.id
        let currentVal  = sigContainer.currentValue
        let signalProxy = new Signal(currentVal)
        signalProxy.id  = signalId
        signalPool.newSignal(signalProxy)
        commMedium.sendMessage(sigContainer.ownerId,new RegisterExternalSignalMessage(thisRef,thisRef.ownerId,signalId,(thisRef as ServerFarReference).ownerAddress,(thisRef as ServerFarReference).ownerPort))
        return signalProxy
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
        case ValueContainer.isolateType:
            return deSerialiseIsolate(value as IsolateContainer)
        case ValueContainer.isolateDefType:
            return deSerialiseIsolateDefinition(value as IsolateDefinitionContainer)
        case ValueContainer.arrayIsolateType:
            return deSerialiseArrayIsolate(value as ArrayIsolateContainer)
        case ValueContainer.repliqType:
            return deSerialiseRepliq(value as RepliqContainer)
        case ValueContainer.repliqDefinition:
            return deSerialiseRepliqDefinition(value as RepliqDefinitionContainer)
        case ValueContainer.signalType:
            return deSerialiseSignal(value as SignalContainer)
        default :
            throw "Unknown value container type :  " + value.type
    }
}