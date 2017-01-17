import {PromisePool, PromiseAllocation} from "./PromisePool";
import {SocketManager} from "./sockets";
import {ResolvePromiseMessage, RejectPromiseMessage} from "./messages";
import {ObjectPool} from "./objectPool";
import {ServerFarReference} from "./farRef";
import {Isolate} from "./spiders";
/**
 * Created by flo on 19/12/2016.
 */

//Enables to detect true type of instances (e.g. array)
function toType(obj : any) : string {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}


export function getObjectVars(object : Object,thisRef : ServerFarReference,receiverId : string,socketManager : SocketManager,promisePool : PromisePool,objectPool : ObjectPool) : Array<any>{
    var vars        = []
    var properties  = Reflect.ownKeys(object)
    for(var i in properties){
        var key             = properties[i]
        var val             = Reflect.get(object,key)
        var serialisedval   = serialise(val,thisRef,receiverId,socketManager,promisePool,objectPool)
        vars.push([key,serialisedval])
    }
    return vars
}
export function getObjectMethods(object : Object) : Array<any>{
    var methods     = []
    var proto       = Object.getPrototypeOf(object)
    var properties  = Reflect.ownKeys(proto)
    //Property at index 0 is the constructor, which doesn't need to be serialised given that we are transmitting an instance of the class extending Actor
    properties.shift()
    for(var i in properties){
        var key     = properties[i]
        var method  = Reflect.get(proto,key)
        if(typeof method == 'function'){
            methods.push([key,method.toString()])
        }
    }
    return methods
}

export function deconstructBehaviour(object : any,accumVars : Array<any>,accumMethods : Array<any>,thisRef : ServerFarReference,receiverId : string,socketManager : SocketManager,promisePool : PromisePool,objectPool : ObjectPool){
    var properties  = Reflect.ownKeys(object)
    for(var i in properties){
        var key             = properties[i]
        var val             = Reflect.get(object,key)
        if(typeof val != 'function' || isIsolateClass(val)){
            var serialisedval   = serialise(val,thisRef,receiverId,socketManager,promisePool,objectPool)
            accumVars.push([key,serialisedval])
        }
    }
    var proto = object.__proto__
    properties = Reflect.ownKeys(proto)
    properties.shift()
    var lastProto = properties.indexOf("spawn") != -1
    if(!lastProto){
        for(var i in properties){
            var key     = properties[i]
            var method  = Reflect.get(proto,key)
            if(typeof method == 'function'){
                accumMethods.push([key,method.toString()])
            }
        }
        return deconstructBehaviour(proto,accumVars,accumMethods,thisRef,receiverId,socketManager,promisePool,objectPool)
    }
    else{
        return [accumVars,accumMethods]
    }
}

export function reconstructObject(variables : Array<any>, methods : Array<any>,thisRef : ServerFarReference,promisePool : PromisePool,socketManager : SocketManager,objectPool : ObjectPool) {
    var ob = {}
    for(var i in variables){
        var key     = variables[i][0]
        var rawVal  = variables[i][1]
        var val     = deserialise(thisRef,rawVal,promisePool,socketManager,objectPool)
        ob[key]     = val
    }
    for(var i in methods){
        var key             = methods[i][0]
        var functionSource  = methods[i][1]
        var method =  eval("with(ob){(function " + functionSource + ")}")
        ob[key]             = method
    }
    return ob
}

export abstract class ValueContainer{
    static nativeType           : number = 0
    static promiseType          : number = 1
    static serverFarRefType     : number = 2
    static errorType            : number = 3
    static arrayType            : number = 4
    static isolateType          : number = 5
    static isolateDefType       : number = 6
    type                        : number

    constructor(type : number){
        this.type = type
    }
}

type NativeValue =  number | boolean | string
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

function isClass(func : Function) : boolean{
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}

function isIsolateClass(func : Function) : boolean {
    return (func.toString().search(/extends.*?Isolate/) != -1)
}

function serialisePromise(promise,thisRef : ServerFarReference,receiverId : string,socketManager : SocketManager,promisePool : PromisePool,objectPool : ObjectPool){
    var wrapper : PromiseAllocation = promisePool.newPromise()
    promise.then((val) => {
        socketManager.sendMessage(receiverId,new ResolvePromiseMessage(thisRef.ownerId,thisRef.ownerAddress,thisRef.ownerPort,wrapper.promiseId,serialise(val,thisRef,receiverId,socketManager,promisePool,objectPool),true))
    })
    promise.catch((reason) => {
        socketManager.sendMessage(receiverId,new RejectPromiseMessage(thisRef.ownerId,thisRef.ownerAddress,thisRef.ownerPort,wrapper.promiseId,serialise(reason,thisRef,receiverId,socketManager,promisePool,objectPool),true))
    })
    return new PromiseContainer(wrapper.promiseId,thisRef.ownerId)
}

function serialiseObject(object : Object,thisRef : ServerFarReference,objectPool : ObjectPool){
    var oId = objectPool.allocateObject(object)
    return new ServerFarRefContainer(oId,thisRef.ownerId,thisRef.ownerAddress,thisRef.ownerPort)
}

export function serialise(value,thisRef : ServerFarReference,receiverId : string,socketManager : SocketManager,promisePool : PromisePool,objectPool : ObjectPool) : ValueContainer{
    if(typeof value == 'object'){
        if(value instanceof Promise){
            return serialisePromise(value,thisRef,receiverId,socketManager,promisePool,objectPool)
        }
        else if(value instanceof Error){
            return new ErrorContainer(value)
        }
        else if(value instanceof Array){
            var values : Array<ValueContainer> = value.map((val) => {
                return serialise(val,thisRef,receiverId,socketManager,promisePool,objectPool)
            })
            return new ArrayContainer(values)
        }
        else if(value[ServerFarReference.proxyTypeAccessorKey]){
            var farRef : ServerFarReference = value[ServerFarReference.farRefAccessorKey]
            return new ServerFarRefContainer(farRef.objectId,farRef.ownerId,farRef.ownerAddress,farRef.ownerPort)
        }
        else if(value[IsolateContainer.checkIsolateFuncKey]){
            var vars    = getObjectVars(value,thisRef,receiverId,socketManager,promisePool,objectPool)
            var methods = getObjectMethods(value)
            return new IsolateContainer(JSON.stringify(vars),JSON.stringify(methods))
        }
        else {
            return serialiseObject(value,thisRef,objectPool)
        }
    }
    else if(typeof value == 'function'){
        //Value is actualy not a function but the result of a field access on a proxy (which is technically a function, see farRef)
        if(value[ServerFarReference.proxyWrapperAccessorKey]){
            return serialisePromise(value,thisRef,receiverId,socketManager,promisePool,objectPool)
        }
        else if(isClass(value) && isIsolateClass(value)){
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/,'')
            return new IsolateDefinitionContainer(definition)
        }
        else if(isClass(value)){
            throw new Error("Serialisation of classes disallowed")
        }
        else{
            throw new Error("Serialisation of functions disallowed")
        }
    }
    else {
        return new NativeContainer(value)
    }
}

export function deserialise(thisRef : ServerFarReference,value : ValueContainer,promisePool : PromisePool,socketManager : SocketManager,objectPool : ObjectPool) : any{
    function deSerialisePromise(promiseContainer : PromiseContainer){
        return promisePool.newForeignPromise(promiseContainer.promiseId,promiseContainer.promiseCreatorId)
    }

    function deSerialiseFarRef(farRefContainer : ServerFarRefContainer){
        var farRef = new ServerFarReference(farRefContainer.objectId,farRefContainer.ownerAddress,farRefContainer.ownerPort,farRefContainer.ownerId,thisRef,socketManager,promisePool,objectPool)
        if(!(socketManager.hasConnection(farRef.ownerId))){
            socketManager.openConnection(farRef.ownerId,farRef.ownerAddress,farRef.ownerPort)
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
            return deserialise(thisRef,valCont,promisePool,socketManager,objectPool)
        })
        return deserialised
    }

    function deSerialiseIsolate(isolateContainer : IsolateContainer){
        var isolate = reconstructObject(JSON.parse(isolateContainer.vars),JSON.parse(isolateContainer.methods),thisRef,promisePool,socketManager,objectPool)
        isolate[IsolateContainer.checkIsolateFuncKey] = true
        return isolate
    }

    function deSerialiseIsolateDefinition(isolateDefContainer : IsolateDefinitionContainer){
        var classObj = eval(isolateDefContainer.definition)
        classObj.prototype[IsolateContainer.checkIsolateFuncKey] = true
        return classObj
    }

    switch(value.type){
        case ValueContainer.nativeType :
            return (value as NativeContainer).value
        case ValueContainer.promiseType:
            return deSerialisePromise(value as PromiseContainer)
        case ValueContainer.serverFarRefType:
            return deSerialiseFarRef(value as ServerFarRefContainer)
        case ValueContainer.errorType:
            return deSerialiseError(value as ErrorContainer)
        case ValueContainer.arrayType:
            return deSerialiseArray(value as ArrayContainer)
        case ValueContainer.isolateType:
            return deSerialiseIsolate(value as IsolateContainer)
        case ValueContainer.isolateDefType:
            return deSerialiseIsolateDefinition(value as IsolateDefinitionContainer)
        default :
            throw "Unknown value container type :  " + value
    }
}