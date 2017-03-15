"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var messages_1 = require("./messages");
var farRef_1 = require("./farRef");
var spiders_1 = require("./spiders");
/**
 * Created by flo on 19/12/2016.
 */
//Enables to detect true type of instances (e.g. array)
function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
function getObjectVars(object, thisRef, receiverId, commMedium, promisePool, objectPool) {
    var vars = [];
    var properties = Reflect.ownKeys(object);
    for (var i in properties) {
        var key = properties[i];
        var val = Reflect.get(object, key);
        var serialisedval = serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool);
        vars.push([key, serialisedval]);
    }
    return vars;
}
exports.getObjectVars = getObjectVars;
function getObjectMethods(object) {
    var methods = [];
    var proto = Object.getPrototypeOf(object);
    var properties = Reflect.ownKeys(proto);
    //Property at index 0 is the constructor, which doesn't need to be serialised given that we are transmitting an instance of the class extending Actor
    properties.shift();
    for (var i in properties) {
        var key = properties[i];
        var method = Reflect.get(proto, key);
        if (typeof method == 'function') {
            methods.push([key, method.toString()]);
        }
    }
    return methods;
}
exports.getObjectMethods = getObjectMethods;
function deconstructStatic(actorClass, thisRef, receiverId, commMedium, promisePool, objectPool, results) {
    //Reached the end of the class chain (i.e. current class is function(){})
    if (actorClass.name == "") {
        return results;
    }
    else {
        var thisName = actorClass.name;
        var thisVars = [];
        var thisMethods = [];
        var keys = Reflect.ownKeys(actorClass);
        keys.forEach(function (key) {
            //Avoid sending the prototype and other function specific properties (given that classes are just functions)
            if (!(key == "prototype" || key == "name" || key == "length")) {
                var property = Reflect.get(actorClass, key);
                if (property instanceof Function) {
                    thisMethods.push([key, property.toString()]);
                }
                else {
                    thisVars.push([key, serialise(property, thisRef, receiverId, commMedium, promisePool, objectPool)]);
                }
            }
        });
        results.push([thisName, thisVars, thisMethods]);
        return deconstructStatic(actorClass.__proto__, thisRef, receiverId, commMedium, promisePool, objectPool, results);
    }
}
exports.deconstructStatic = deconstructStatic;
function constructMethod(functionSource) {
    if (functionSource.startsWith("function")) {
        var method = eval("(" + functionSource + ")");
    }
    else {
        var method = eval("(function " + functionSource + ")");
    }
    return method;
}
function reconstructStatic(behaviourObject, staticProperties, thisRef, promisePool, commMedium, objectPool) {
    staticProperties.forEach(function (propertyArray) {
        var className = propertyArray[0];
        var stub = {};
        var vars = propertyArray[1];
        var methods = propertyArray[2];
        vars.forEach(function (varPair) {
            var key = varPair[0];
            var val = deserialise(thisRef, varPair[1], promisePool, commMedium, objectPool);
            stub[key] = val;
        });
        methods.forEach(function (methodPair) {
            var key = methodPair[0];
            var functionSource = methodPair[1];
            var method;
            /*if(functionSource.startsWith("function")){
                method =  eval("with(behaviourObject){(" + functionSource + ")}")
            }
            else{
                method =  eval("with(behaviourObject){(function " + functionSource + ")}")
            }*/
            stub[key] = constructMethod(functionSource);
        });
        var stubProxy = new Proxy(stub, {
            set: function (obj, prop, value) {
                throw new Error("Cannot mutate static property in actors");
            }
        });
        behaviourObject[className] = stubProxy;
    });
}
exports.reconstructStatic = reconstructStatic;
function deconstructBehaviour(object, currentLevel, accumVars, accumMethods, thisRef, receiverId, commMedium, promisePool, objectPool) {
    var properties = Reflect.ownKeys(object);
    var localAccumVars = [];
    for (var i in properties) {
        var key = properties[i];
        var val = Reflect.get(object, key);
        if (typeof val != 'function' || isIsolateClass(val)) {
            var serialisedval = serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool);
            localAccumVars.push([key, serialisedval]);
        }
    }
    localAccumVars.unshift(currentLevel);
    accumVars.push(localAccumVars);
    var localAccumMethods = [];
    var proto = object.__proto__;
    properties = Reflect.ownKeys(proto);
    properties.shift();
    var lastProto = properties.indexOf("spawn") != -1;
    if (!lastProto) {
        for (var i in properties) {
            var key = properties[i];
            var method = Reflect.get(proto, key);
            if (typeof method == 'function') {
                localAccumMethods.push([key, method.toString()]);
            }
        }
        localAccumMethods.unshift(currentLevel + 1);
        accumMethods.push(localAccumMethods);
        return deconstructBehaviour(proto, currentLevel + 1, accumVars, accumMethods, thisRef, receiverId, commMedium, promisePool, objectPool);
    }
    else {
        return [accumVars, accumMethods];
    }
}
exports.deconstructBehaviour = deconstructBehaviour;
function reconstructBehaviour(baseObject, variables, methods, thisRef, promisePool, commMedium, objectPool) {
    var amountOfProtos = methods.length;
    for (var i = 0; i < amountOfProtos; i++) {
        var copy = baseObject.__proto__;
        var newProto = {};
        newProto.__proto__ = copy;
        baseObject.__proto__ = newProto;
    }
    variables.forEach(function (levelVariables) {
        var installIn = getProtoForLevel(levelVariables[0], baseObject);
        levelVariables.shift();
        levelVariables.forEach(function (varEntry) {
            var key = varEntry[0];
            var rawVal = varEntry[1];
            var val = deserialise(thisRef, rawVal, promisePool, commMedium, objectPool);
            installIn[key] = val;
        });
    });
    methods.forEach(function (levelMethods) {
        var installIn = getProtoForLevel(levelMethods[0], baseObject);
        levelMethods.shift();
        levelMethods.forEach(function (methodEntry) {
            var key = methodEntry[0];
            var functionSource = methodEntry[1];
            //Ugly but re-serialised isolates have functions, not methods (semantically the same, not the same when stringified). This is a quick-fix
            /*if(functionSource.startsWith("function")){
                var method =  eval("with(baseObject){(" + functionSource + ")}")
            }
            else{
                var method =  eval("with(baseObject){(function " + functionSource + ")}")
            }*/
            installIn[key] = constructMethod(functionSource);
        });
    });
    return baseObject;
}
exports.reconstructBehaviour = reconstructBehaviour;
function getProtoForLevel(level, object) {
    var ret = object;
    for (var i = 0; i < level; i++) {
        ret = ret.__proto__;
    }
    return ret;
}
function reconstructObject(baseObject, variables, methods, thisRef, promisePool, commMedium, objectPool) {
    variables.forEach(function (varEntry) {
        var key = varEntry[0];
        var rawVal = varEntry[1];
        var val = deserialise(thisRef, rawVal, promisePool, commMedium, objectPool);
        baseObject[key] = val;
    });
    methods.forEach(function (methodEntry) {
        var key = methodEntry[0];
        var functionSource = methodEntry[1];
        //Ugly but re-serialised isolates have functions, not methods (semantically the same, not the same when stringified). This is a quick-fix
        /*if(functionSource.startsWith("function")){
            var method =  eval("with(baseObject){(" + functionSource + ")}")
        }
        else{
            var method =  eval("with(baseObject){(function " + functionSource + ")}")
        }*/
        (baseObject.__proto__)[key] = constructMethod(functionSource);
    });
    return baseObject;
}
exports.reconstructObject = reconstructObject;
var ValueContainer = (function () {
    function ValueContainer(type) {
        this.type = type;
    }
    ValueContainer.nativeType = 0;
    ValueContainer.promiseType = 1;
    ValueContainer.serverFarRefType = 2;
    ValueContainer.errorType = 3;
    ValueContainer.arrayType = 4;
    ValueContainer.isolateType = 5;
    ValueContainer.isolateDefType = 6;
    ValueContainer.clientFarRefType = 7;
    ValueContainer.arrayIsolateType = 8;
    return ValueContainer;
}());
exports.ValueContainer = ValueContainer;
var NativeContainer = (function (_super) {
    __extends(NativeContainer, _super);
    function NativeContainer(value) {
        _super.call(this, ValueContainer.nativeType);
        this.value = value;
    }
    return NativeContainer;
}(ValueContainer));
exports.NativeContainer = NativeContainer;
var PromiseContainer = (function (_super) {
    __extends(PromiseContainer, _super);
    function PromiseContainer(promiseId, promiseCreatorId) {
        _super.call(this, ValueContainer.promiseType);
        this.promiseId = promiseId;
        this.promiseCreatorId = promiseCreatorId;
    }
    return PromiseContainer;
}(ValueContainer));
exports.PromiseContainer = PromiseContainer;
var ServerFarRefContainer = (function (_super) {
    __extends(ServerFarRefContainer, _super);
    function ServerFarRefContainer(objectId, ownerId, ownerAddress, ownerPort) {
        _super.call(this, ValueContainer.serverFarRefType);
        this.objectId = objectId;
        this.ownerId = ownerId;
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
    return ServerFarRefContainer;
}(ValueContainer));
exports.ServerFarRefContainer = ServerFarRefContainer;
var ClientFarRefContainer = (function (_super) {
    __extends(ClientFarRefContainer, _super);
    function ClientFarRefContainer(objectId, ownerId, mainId, contactId, contactAddress, contactPort) {
        _super.call(this, ValueContainer.clientFarRefType);
        this.objectId = objectId;
        this.ownerId = ownerId;
        this.mainId = mainId;
        this.contactId = contactId;
        this.contactAddress = contactAddress;
        this.contactPort = contactPort;
    }
    return ClientFarRefContainer;
}(ValueContainer));
exports.ClientFarRefContainer = ClientFarRefContainer;
var ErrorContainer = (function (_super) {
    __extends(ErrorContainer, _super);
    function ErrorContainer(error) {
        _super.call(this, ValueContainer.errorType);
        this.message = error.message;
        this.stack = error.stack;
        this.name = error.name;
    }
    return ErrorContainer;
}(ValueContainer));
exports.ErrorContainer = ErrorContainer;
var ArrayContainer = (function (_super) {
    __extends(ArrayContainer, _super);
    function ArrayContainer(values) {
        _super.call(this, ValueContainer.arrayType);
        this.values = values;
    }
    return ArrayContainer;
}(ValueContainer));
exports.ArrayContainer = ArrayContainer;
var IsolateContainer = (function (_super) {
    __extends(IsolateContainer, _super);
    function IsolateContainer(vars, methods) {
        _super.call(this, ValueContainer.isolateType);
        this.vars = vars;
        this.methods = methods;
    }
    IsolateContainer.checkIsolateFuncKey = "_INSTANCEOF_ISOLATE_";
    return IsolateContainer;
}(ValueContainer));
exports.IsolateContainer = IsolateContainer;
var IsolateDefinitionContainer = (function (_super) {
    __extends(IsolateDefinitionContainer, _super);
    function IsolateDefinitionContainer(definition) {
        _super.call(this, ValueContainer.isolateDefType);
        this.definition = definition;
    }
    return IsolateDefinitionContainer;
}(ValueContainer));
exports.IsolateDefinitionContainer = IsolateDefinitionContainer;
var ArrayIsolateContainer = (function (_super) {
    __extends(ArrayIsolateContainer, _super);
    function ArrayIsolateContainer(array) {
        _super.call(this, ValueContainer.arrayIsolateType);
        this.array = array;
    }
    ArrayIsolateContainer.checkArrayIsolateFuncKey = "_INSTANCEOF_ARRAY_ISOLATE_";
    return ArrayIsolateContainer;
}(ValueContainer));
exports.ArrayIsolateContainer = ArrayIsolateContainer;
function isClass(func) {
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}
function isIsolateClass(func) {
    return (func.toString().search(/extends.*?Isolate/) != -1);
}
function serialisePromise(promise, thisRef, receiverId, commMedium, promisePool, objectPool) {
    var wrapper = promisePool.newPromise();
    promise.then(function (val) {
        commMedium.sendMessage(receiverId, new messages_1.ResolvePromiseMessage(thisRef, wrapper.promiseId, serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool), true));
    });
    promise.catch(function (reason) {
        commMedium.sendMessage(receiverId, new messages_1.RejectPromiseMessage(thisRef, wrapper.promiseId, serialise(reason, thisRef, receiverId, commMedium, promisePool, objectPool), true));
    });
    return new PromiseContainer(wrapper.promiseId, thisRef.ownerId);
}
function serialiseObject(object, thisRef, objectPool) {
    var oId = objectPool.allocateObject(object);
    if (thisRef instanceof farRef_1.ServerFarReference) {
        return new ServerFarRefContainer(oId, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
    }
    else {
        var clientRef = thisRef;
        return new ClientFarRefContainer(oId, clientRef.ownerId, clientRef.mainId, clientRef.contactId, clientRef.contactAddress, clientRef.contactPort);
    }
}
function serialise(value, thisRef, receiverId, commMedium, promisePool, objectPool) {
    if (typeof value == 'object') {
        if (value == null) {
            return new NativeContainer(null);
        }
        else if (value instanceof Promise) {
            return serialisePromise(value, thisRef, receiverId, commMedium, promisePool, objectPool);
        }
        else if (value instanceof Error) {
            return new ErrorContainer(value);
        }
        else if (value[farRef_1.FarReference.ServerProxyTypeKey]) {
            var farRef = value[farRef_1.FarReference.farRefAccessorKey];
            return new ServerFarRefContainer(farRef.objectId, farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
        }
        else if (value[farRef_1.FarReference.ClientProxyTypeKey]) {
            var farRef_2 = value[farRef_1.FarReference.farRefAccessorKey];
            if (thisRef instanceof farRef_1.ServerFarReference && farRef_2.contactId == null) {
                //Current actor is a server and is the first to obtain a reference to this client actor. conversation with this client should now be rooted through this actor given that it has a socket reference to it
                return new ClientFarRefContainer(farRef_2.objectId, farRef_2.ownerId, farRef_2.mainId, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
            }
            else {
                return new ClientFarRefContainer(farRef_2.objectId, farRef_2.ownerId, farRef_2.mainId, farRef_2.contactId, farRef_2.contactAddress, farRef_2.contactPort);
            }
        }
        else if (value[ArrayIsolateContainer.checkArrayIsolateFuncKey]) {
            return new ArrayIsolateContainer(value.array);
        }
        else if (value instanceof Array) {
            var values = value.map(function (val) {
                return serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool);
            });
            return new ArrayContainer(values);
        }
        else if (value[IsolateContainer.checkIsolateFuncKey]) {
            var vars = getObjectVars(value, thisRef, receiverId, commMedium, promisePool, objectPool);
            var methods = getObjectMethods(value);
            return new IsolateContainer(JSON.stringify(vars), JSON.stringify(methods));
        }
        else {
            return serialiseObject(value, thisRef, objectPool);
        }
    }
    else if (typeof value == 'function') {
        //Value is actualy not a function but the result of a field access on a proxy (which is technically a function, see farRef)
        if (value[farRef_1.FarReference.proxyWrapperAccessorKey]) {
            return serialisePromise(value, thisRef, receiverId, commMedium, promisePool, objectPool);
        }
        else if (isClass(value) && isIsolateClass(value)) {
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            return new IsolateDefinitionContainer(definition.replace("super()", ''));
        }
        else if (isClass(value)) {
            throw new Error("Serialisation of classes disallowed");
        }
        else {
            throw new Error("Serialisation of functions disallowed: " + value.toString());
        }
    }
    else {
        return new NativeContainer(value);
    }
}
exports.serialise = serialise;
function deserialise(thisRef, value, promisePool, commMedium, objectPool) {
    function deSerialisePromise(promiseContainer) {
        return promisePool.newForeignPromise(promiseContainer.promiseId, promiseContainer.promiseCreatorId);
    }
    function deSerialiseServerFarRef(farRefContainer) {
        var farRef = new farRef_1.ServerFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.ownerAddress, farRefContainer.ownerPort, thisRef, commMedium, promisePool, objectPool);
        if (thisRef instanceof farRef_1.ServerFarReference) {
            if (!(commMedium.hasConnection(farRef.ownerId))) {
                commMedium.openConnection(farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
            }
        }
        else {
            if (!(commMedium.hasConnection(farRef.ownerId))) {
                commMedium.connectTransientRemote(thisRef, farRef, promisePool);
            }
        }
        return farRef.proxyify();
    }
    function deSerialiseClientFarRef(farRefContainer) {
        var farRef;
        if ((thisRef instanceof farRef_1.ServerFarReference) && farRefContainer.contactId == null) {
            //This is the first server side actor to come into contact with this client-side far reference and will henceforth be the contact point for all messages sent to this far reference
            farRef = new farRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.mainId, thisRef, commMedium, promisePool, objectPool, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
        }
        else {
            farRef = new farRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.mainId, thisRef, commMedium, promisePool, objectPool, farRefContainer.contactId, farRefContainer.contactAddress, farRefContainer.contactPort);
        }
        return farRef.proxyify();
    }
    function deSerialiseError(errorContainer) {
        var error = new Error(errorContainer.message);
        error.stack = errorContainer.stack;
        error.name = errorContainer.name;
        return error;
    }
    function deSerialiseArray(arrayContainer) {
        var deserialised = arrayContainer.values.map(function (valCont) {
            return deserialise(thisRef, valCont, promisePool, commMedium, objectPool);
        });
        return deserialised;
    }
    function deSerialiseIsolate(isolateContainer) {
        var isolate = reconstructObject(new spiders_1.Isolate(), JSON.parse(isolateContainer.vars), JSON.parse(isolateContainer.methods), thisRef, promisePool, commMedium, objectPool);
        return isolate;
    }
    function deSerialiseIsolateDefinition(isolateDefContainer) {
        var classObj = eval(isolateDefContainer.definition);
        classObj.prototype[IsolateContainer.checkIsolateFuncKey] = true;
        return classObj;
    }
    function deSerialiseArrayIsolate(arrayIsolateContainer) {
        return arrayIsolateContainer.array;
    }
    switch (value.type) {
        case ValueContainer.nativeType:
            return value.value;
        case ValueContainer.promiseType:
            return deSerialisePromise(value);
        case ValueContainer.clientFarRefType:
            return deSerialiseClientFarRef(value);
        case ValueContainer.serverFarRefType:
            return deSerialiseServerFarRef(value);
        case ValueContainer.errorType:
            return deSerialiseError(value);
        case ValueContainer.arrayType:
            return deSerialiseArray(value);
        case ValueContainer.isolateType:
            return deSerialiseIsolate(value);
        case ValueContainer.isolateDefType:
            return deSerialiseIsolateDefinition(value);
        case ValueContainer.arrayIsolateType:
            return deSerialiseArrayIsolate(value);
        default:
            throw "Unknown value container type :  " + value.type;
    }
}
exports.deserialise = deserialise;
