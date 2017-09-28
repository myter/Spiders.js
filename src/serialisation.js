///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("./messages");
const farRef_1 = require("./farRef");
const spiders_1 = require("./spiders");
const Repliq_1 = require("./Replication/Repliq");
const RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
const RepliqObjectField_1 = require("./Replication/RepliqObjectField");
const signal_1 = require("./Reactivivity/signal");
var Signal = require("./Reactivivity/signal").Signal;
/**
 * Created by flo on 19/12/2016.
 */
//Enables to detect true type of instances (e.g. array)
function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
function getObjectVars(object, receiverId, environment, ignoreSet = []) {
    var vars = [];
    var properties = Reflect.ownKeys(object);
    for (var i in properties) {
        var key = properties[i];
        if (!ignoreSet.includes(key)) {
            var val = Reflect.get(object, key);
            var serialisedval = serialise(val, receiverId, environment);
            vars.push([key, serialisedval]);
        }
    }
    return vars;
}
exports.getObjectVars = getObjectVars;
function getObjectMethods(object) {
    var methods = [];
    var proto = Object.getPrototypeOf(object);
    var properties = Reflect.ownKeys(proto);
    for (var i in properties) {
        var key = properties[i];
        var method = Reflect.get(proto, key);
        //Avoid copying over any construction functions (i.e. class declarations)
        if (typeof method == 'function' && !(method.toString()).startsWith("class")) {
            methods.push([key, method.toString()]);
        }
    }
    return methods;
}
exports.getObjectMethods = getObjectMethods;
function deconstructStatic(actorClass, receiverId, results, environment) {
    //Reached the end of the class chain (i.e. current class is function(){})
    if (actorClass.name == "") {
        return results;
    }
    else {
        var thisName = actorClass.name;
        var thisVars = [];
        var thisMethods = [];
        var keys = Reflect.ownKeys(actorClass);
        keys.forEach((key) => {
            //Avoid sending the prototype and other function specific properties (given that classes are just functions)
            if (!(key == "prototype" || key == "name" || key == "length")) {
                var property = Reflect.get(actorClass, key);
                if (property instanceof Function) {
                    thisMethods.push([key, property.toString()]);
                }
                else {
                    thisVars.push([key, serialise(property, receiverId, environment)]);
                }
            }
        });
        results.push([thisName, thisVars, thisMethods]);
        return deconstructStatic(actorClass.__proto__, receiverId, results, environment);
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
function reconstructStatic(behaviourObject, staticProperties, environment) {
    staticProperties.forEach((propertyArray) => {
        var className = propertyArray[0];
        var stub = {};
        var vars = propertyArray[1];
        var methods = propertyArray[2];
        vars.forEach((varPair) => {
            var key = varPair[0];
            var val = deserialise(varPair[1], environment);
            stub[key] = val;
        });
        methods.forEach((methodPair) => {
            var key = methodPair[0];
            var functionSource = methodPair[1];
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
function deconstructBehaviour(object, currentLevel, accumVars, accumMethods, receiverId, environment) {
    var properties = Reflect.ownKeys(object);
    var localAccumVars = [];
    for (var i in properties) {
        var key = properties[i];
        var val = Reflect.get(object, key);
        if (typeof val != 'function' || isIsolateClass(val) || isRepliqClass(val) || isSignalClass(val)) {
            var serialisedval = serialise(val, receiverId, environment);
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
        return deconstructBehaviour(proto, currentLevel + 1, accumVars, accumMethods, receiverId, environment);
    }
    else {
        return [accumVars, accumMethods];
    }
}
exports.deconstructBehaviour = deconstructBehaviour;
function reconstructBehaviour(baseObject, variables, methods, environment) {
    var amountOfProtos = methods.length;
    for (var i = 0; i < amountOfProtos; i++) {
        var copy = baseObject.__proto__;
        var newProto = {};
        newProto.__proto__ = copy;
        baseObject.__proto__ = newProto;
    }
    variables.forEach((levelVariables) => {
        var installIn = getProtoForLevel(levelVariables[0], baseObject);
        levelVariables.shift();
        levelVariables.forEach((varEntry) => {
            var key = varEntry[0];
            var rawVal = varEntry[1];
            var val = deserialise(rawVal, environment);
            installIn[key] = val;
        });
    });
    methods.forEach((levelMethods) => {
        var installIn = getProtoForLevel(levelMethods[0], baseObject);
        levelMethods.shift();
        levelMethods.forEach((methodEntry) => {
            var key = methodEntry[0];
            var functionSource = methodEntry[1];
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
function reconstructObject(baseObject, variables, methods, environment) {
    variables.forEach((varEntry) => {
        var key = varEntry[0];
        var rawVal = varEntry[1];
        var val = deserialise(rawVal, environment);
        baseObject[key] = val;
    });
    methods.forEach((methodEntry) => {
        var key = methodEntry[0];
        var functionSource = methodEntry[1];
        (baseObject.__proto__)[key] = constructMethod(functionSource);
    });
    return baseObject;
}
exports.reconstructObject = reconstructObject;
class ValueContainer {
    constructor(type) {
        this.type = type;
    }
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
ValueContainer.repliqType = 9;
ValueContainer.repliqFieldType = 10;
ValueContainer.repliqDefinition = 11;
ValueContainer.signalType = 12;
ValueContainer.signalDefinition = 13;
exports.ValueContainer = ValueContainer;
class NativeContainer extends ValueContainer {
    constructor(value) {
        super(ValueContainer.nativeType);
        this.value = value;
    }
}
exports.NativeContainer = NativeContainer;
class PromiseContainer extends ValueContainer {
    constructor(promiseId, promiseCreatorId) {
        super(ValueContainer.promiseType);
        this.promiseId = promiseId;
        this.promiseCreatorId = promiseCreatorId;
    }
}
exports.PromiseContainer = PromiseContainer;
class ServerFarRefContainer extends ValueContainer {
    constructor(objectId, ownerId, ownerAddress, ownerPort) {
        super(ValueContainer.serverFarRefType);
        this.objectId = objectId;
        this.ownerId = ownerId;
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
}
exports.ServerFarRefContainer = ServerFarRefContainer;
class ClientFarRefContainer extends ValueContainer {
    constructor(objectId, ownerId, mainId, contactId, contactAddress, contactPort) {
        super(ValueContainer.clientFarRefType);
        this.objectId = objectId;
        this.ownerId = ownerId;
        this.mainId = mainId;
        this.contactId = contactId;
        this.contactAddress = contactAddress;
        this.contactPort = contactPort;
    }
}
exports.ClientFarRefContainer = ClientFarRefContainer;
class ErrorContainer extends ValueContainer {
    constructor(error) {
        super(ValueContainer.errorType);
        this.message = error.message;
        this.stack = error.stack;
        this.name = error.name;
    }
}
exports.ErrorContainer = ErrorContainer;
class ArrayContainer extends ValueContainer {
    constructor(values) {
        super(ValueContainer.arrayType);
        this.values = values;
    }
}
exports.ArrayContainer = ArrayContainer;
class IsolateContainer extends ValueContainer {
    constructor(vars, methods) {
        super(ValueContainer.isolateType);
        this.vars = vars;
        this.methods = methods;
    }
}
IsolateContainer.checkIsolateFuncKey = "_INSTANCEOF_ISOLATE_";
exports.IsolateContainer = IsolateContainer;
class IsolateDefinitionContainer extends ValueContainer {
    constructor(definition) {
        super(ValueContainer.isolateDefType);
        this.definition = definition;
    }
}
exports.IsolateDefinitionContainer = IsolateDefinitionContainer;
class ArrayIsolateContainer extends ValueContainer {
    constructor(array) {
        super(ValueContainer.arrayIsolateType);
        this.array = array;
    }
}
ArrayIsolateContainer.checkArrayIsolateFuncKey = "_INSTANCEOF_ARRAY_ISOLATE_";
exports.ArrayIsolateContainer = ArrayIsolateContainer;
class RepliqContainer extends ValueContainer {
    constructor(primitiveFields, objectFields, innerRepFields, methods, atomicMethods, repliqId, masterOwnerId, isClient, ownerAddress, ownerPort, lastConfirmedRound, innerName = "") {
        super(ValueContainer.repliqType);
        this.primitiveFields = primitiveFields;
        this.objectFields = objectFields;
        this.innerRepFields = innerRepFields;
        this.innerName = innerName;
        this.methods = methods;
        this.atomicMethods = atomicMethods;
        this.repliqId = repliqId;
        this.masterOwnerId = masterOwnerId;
        this.isClient = isClient;
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
        this.lastConfirmedRound = lastConfirmedRound;
    }
}
RepliqContainer.checkRepliqFuncKey = "_INSTANCEOF_REPLIQ_";
exports.RepliqContainer = RepliqContainer;
class RepliqFieldContainer extends ValueContainer {
    constructor(name, tentative, commited, readFunc, writeFunc, resetFunc, commitFunc, updateFunc) {
        super(ValueContainer.repliqFieldType);
        this.name = name;
        this.tentative = tentative;
        this.commited = commited;
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
        this.resetFunc = resetFunc;
        this.commitFunc = commitFunc;
        this.updateFunc = updateFunc;
    }
}
class RepliqDefinitionContainer extends ValueContainer {
    constructor(definition) {
        super(ValueContainer.repliqDefinition);
        this.definition = definition;
    }
}
exports.RepliqDefinitionContainer = RepliqDefinitionContainer;
//When a signal is serialised and passed to another actor it can implicitly only depend on the original signal
//From the moment the signal is deserialised on the receiving side it will act as a source for that actor
//Hence, all the information needed is the signal's id and its current value
class SignalContainer extends ValueContainer {
    constructor(id, objectValue, currentValue, rateLowerBound, rateUpperBound, clock, strong, ownerId, ownerAddress, ownerPort) {
        super(ValueContainer.signalType);
        this.id = id;
        this.obectValue = objectValue;
        this.currentValue = currentValue;
        this.rateLowerBound = rateLowerBound;
        this.rateUpperBound = rateUpperBound;
        this.clock = clock;
        this.strong = strong;
        this.ownerId = ownerId;
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
}
SignalContainer.checkSignalFuncKey = "_INSTANCEOF_Signal_";
exports.SignalContainer = SignalContainer;
class SignalDefinitionContainer extends ValueContainer {
    constructor(definition, mutators) {
        super(ValueContainer.signalDefinition);
        this.definition = definition;
        this.mutators = mutators;
    }
}
exports.SignalDefinitionContainer = SignalDefinitionContainer;
function isClass(func) {
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}
function isIsolateClass(func) {
    return (func.toString().search(/extends.*?Isolate/) != -1);
}
function isRepliqClass(func) {
    return (func.toString().search(/extends.*?Repliq/) != -1);
}
function isSignalClass(func) {
    return (func.toString().search(/extends.*?Signal/) != -1);
}
function serialisePromise(promise, receiverId, enviroment) {
    var wrapper = enviroment.promisePool.newPromise();
    promise.then((val) => {
        enviroment.commMedium.sendMessage(receiverId, new messages_1.ResolvePromiseMessage(enviroment.thisRef, wrapper.promiseId, serialise(val, receiverId, enviroment), true));
    });
    promise.catch((reason) => {
        enviroment.commMedium.sendMessage(receiverId, new messages_1.RejectPromiseMessage(enviroment.thisRef, wrapper.promiseId, serialise(reason, receiverId, enviroment), true));
    });
    return new PromiseContainer(wrapper.promiseId, enviroment.thisRef.ownerId);
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
function serialiseRepliqFields(fields, receiverId, environment) {
    let primitives = [];
    let objects = [];
    let innerReps = [];
    let ret = [primitives, objects, innerReps];
    fields.forEach((repliqField, fieldName) => {
        if (repliqField instanceof RepliqPrimitiveField_1.RepliqPrimitiveField) {
            primitives.push(new RepliqFieldContainer(fieldName, repliqField.tentative, repliqField.commited, repliqField.read.toString(), repliqField.writeField.toString(), repliqField.resetToCommit.toString(), repliqField.commit.toString(), repliqField.update.toString()));
        }
        else if (repliqField instanceof RepliqObjectField_1.RepliqObjectField) {
            let field = repliqField;
            let tentMethods;
            let commMethods;
            //Avoid copying over Object prototype methods containing native javascript code (cannot be evalled by deserialiser)
            if (Object.getPrototypeOf(field.tentative) == Object.getPrototypeOf({})) {
                tentMethods = [];
                commMethods = [];
            }
            else {
                tentMethods = getObjectMethods(field.tentative);
                commMethods = getObjectMethods(field.commited);
            }
            let tentative = JSON.stringify([JSON.stringify(getObjectVars(field.tentative, receiverId, environment)), JSON.stringify(tentMethods)]);
            let commited = JSON.stringify([JSON.stringify(getObjectVars(field.commited, receiverId, environment)), JSON.stringify(commMethods)]);
            objects.push(new RepliqFieldContainer(fieldName, tentative, commited, field.read.toString(), field.writeField.toString(), field.resetToCommit.toString(), field.commit.toString(), field.update.toString()));
        }
        else if (repliqField[RepliqContainer.checkRepliqFuncKey]) {
            innerReps.push(serialiseRepliq(repliqField, receiverId, environment, fieldName));
        }
        else {
            throw new Error("Unknown Repliq field type in serialisation");
        }
    });
    return ret;
}
function serialiseRepliq(repliqProxy, receiverId, environment, innerName = "") {
    let fields = repliqProxy[Repliq_1.Repliq.getRepliqFields];
    let fieldsArr = serialiseRepliqFields(fields, receiverId, environment);
    let primitiveFields = fieldsArr[0];
    let objectFields = fieldsArr[1];
    let innerReps = fieldsArr[2];
    let methods = repliqProxy[Repliq_1.Repliq.getRepliqOriginalMethods];
    let methodArr = [];
    let atomicArr = [];
    methods.forEach((method, methodName) => {
        if (method[Repliq_1.Repliq.isAtomic]) {
            atomicArr.push([methodName, method.toString()]);
        }
        else {
            methodArr.push([methodName, method.toString()]);
        }
    });
    let repliqId = repliqProxy[Repliq_1.Repliq.getRepliqID];
    let repliqOwnerId = repliqProxy[Repliq_1.Repliq.getRepliqOwnerID];
    let isClient = repliqProxy[Repliq_1.Repliq.isClientMaster];
    let ownerAddress = repliqProxy[Repliq_1.Repliq.getRepliqOwnerAddress];
    let ownerPort = repliqProxy[Repliq_1.Repliq.getRepliqOwnerPort];
    let roundNr;
    //Possible that repliq has not yet been modified at serialisation time
    if (environment.gspInstance.roundNumbers.has(repliqId)) {
        roundNr = environment.gspInstance.roundNumbers.get(repliqId);
    }
    else {
        roundNr = 0;
    }
    let ret = new RepliqContainer(JSON.stringify(primitiveFields), JSON.stringify(objectFields), JSON.stringify(innerReps), JSON.stringify(methodArr), JSON.stringify(atomicArr), repliqId, repliqOwnerId, isClient, ownerAddress, ownerPort, roundNr, innerName);
    if (environment.thisRef instanceof farRef_1.ServerFarReference) {
        if (ret.isClient) {
            environment.gspInstance.addForward(ret.repliqId, ret.masterOwnerId);
            ret.masterOwnerId = environment.thisRef.ownerId;
            ret.ownerAddress = environment.thisRef.ownerAddress;
            ret.ownerPort = environment.thisRef.ownerPort;
            ret.isClient = false;
        }
        else if (ret.ownerAddress == null) {
            ret.ownerAddress = environment.thisRef.ownerAddress;
            ret.ownerPort = environment.thisRef.ownerPort;
            ret.isClient = false;
        }
    }
    else {
        ret.isClient = true;
    }
    return ret;
}
function serialise(value, receiverId, environment) {
    if (typeof value == 'object') {
        if (value == null) {
            return new NativeContainer(null);
        }
        else if (value instanceof Promise) {
            return serialisePromise(value, receiverId, environment);
        }
        else if (value instanceof Error) {
            return new ErrorContainer(value);
        }
        else if (value[farRef_1.FarReference.ServerProxyTypeKey]) {
            var farRef = value[farRef_1.FarReference.farRefAccessorKey];
            return new ServerFarRefContainer(farRef.objectId, farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
        }
        else if (value[farRef_1.FarReference.ClientProxyTypeKey]) {
            let farRef = value[farRef_1.FarReference.farRefAccessorKey];
            if (environment.thisRef instanceof farRef_1.ServerFarReference && farRef.contactId == null) {
                //Current actor is a server and is the first to obtain a reference to this client actor. conversation with this client should now be rooted through this actor given that it has a socket reference to it
                return new ClientFarRefContainer(farRef.objectId, farRef.ownerId, farRef.mainId, environment.thisRef.ownerId, environment.thisRef.ownerAddress, environment.thisRef.ownerPort);
            }
            else {
                return new ClientFarRefContainer(farRef.objectId, farRef.ownerId, farRef.mainId, farRef.contactId, farRef.contactAddress, farRef.contactPort);
            }
        }
        else if (value[ArrayIsolateContainer.checkArrayIsolateFuncKey]) {
            return new ArrayIsolateContainer(value.array);
        }
        else if (value instanceof Array) {
            var values = value.map((val) => {
                return serialise(val, receiverId, environment);
            });
            return new ArrayContainer(values);
        }
        else if (value[IsolateContainer.checkIsolateFuncKey]) {
            var vars = getObjectVars(value, receiverId, environment);
            var methods = getObjectMethods(value);
            return new IsolateContainer(JSON.stringify(vars), JSON.stringify(methods));
        }
        else if (value[RepliqContainer.checkRepliqFuncKey]) {
            return serialiseRepliq(value, receiverId, environment);
        }
        else if (value[SignalContainer.checkSignalFuncKey]) {
            let sig = (value.holder);
            if (!sig.isGarbage) {
                let isValueObject = sig.value instanceof signal_1.SignalObject;
                let val;
                if (isValueObject) {
                    let vars = getObjectVars(sig.value, receiverId, environment, ["holder"]);
                    let methods = getObjectMethods(sig.value);
                    //No need to keep track of which methods are mutators during serialisation. Only owner can mutate and change/propagate!
                    methods.forEach((methodArr, index) => {
                        let name = methodArr[0];
                        if (sig.value[name][signal_1.SignalValue.IS_MUTATOR]) {
                            let sigProto = Object.getPrototypeOf(sig.value);
                            let method = Reflect.get(sigProto, name);
                            methods[index] = [name, method[signal_1.SignalValue.GET_ORIGINAL].toString()];
                        }
                    });
                    val = [JSON.stringify(vars), JSON.stringify(methods)];
                }
                else {
                    //Only way that value isn't an object is if it is the result of a lifted function
                    val = sig.value.lastVal;
                }
                return new SignalContainer(sig.id, isValueObject, val, sig.rateLowerBound, sig.rateUpperBound, sig.clock, sig.tempStrong, environment.thisRef.ownerId, environment.thisRef.ownerAddress, environment.thisRef.ownerPort);
            }
            else {
                throw new Error("Serialisation of signals part of garbage dependency graph dissalowed ");
            }
        }
        else {
            return serialiseObject(value, environment.thisRef, environment.objectPool);
        }
    }
    else if (typeof value == 'function') {
        //Value is actualy not a function but the result of a field access on a proxy (which is technically a function, see farRef)
        if (value[farRef_1.FarReference.proxyWrapperAccessorKey]) {
            return serialisePromise(value, receiverId, environment);
        }
        else if (isClass(value) && isIsolateClass(value)) {
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            return new IsolateDefinitionContainer(definition.replace("super()", ''));
        }
        else if (isClass(value) && isRepliqClass(value)) {
            //TODO might need to extract annotations in same way that is done for signals
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            return new RepliqDefinitionContainer(definition);
        }
        else if (isClass(value) && isSignalClass(value)) {
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            let mutators = [];
            //Need to find out which of the definition's methods are mutating. Can only do this on an instantiated object
            let dummy = new value();
            let methodKeys = Reflect.ownKeys(Object.getPrototypeOf(dummy));
            methodKeys.forEach((methodName) => {
                var property = Reflect.get(Object.getPrototypeOf(dummy), methodName);
                if (property[signal_1.SignalValue.IS_MUTATOR]) {
                    mutators.push(methodName);
                }
            });
            return new SignalDefinitionContainer(definition, mutators);
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
function deserialise(value, enviroment) {
    function deSerialisePromise(promiseContainer) {
        return enviroment.promisePool.newForeignPromise(promiseContainer.promiseId, promiseContainer.promiseCreatorId);
    }
    function deSerialiseServerFarRef(farRefContainer) {
        var farRef = new farRef_1.ServerFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.ownerAddress, farRefContainer.ownerPort, enviroment);
        if (enviroment.thisRef instanceof farRef_1.ServerFarReference) {
            if (!(enviroment.commMedium.hasConnection(farRef.ownerId))) {
                enviroment.commMedium.openConnection(farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
            }
        }
        else {
            if (!(enviroment.commMedium.hasConnection(farRef.ownerId))) {
                enviroment.commMedium.connectTransientRemote(enviroment.thisRef, farRef, enviroment.promisePool);
            }
        }
        return farRef.proxyify();
    }
    function deSerialiseClientFarRef(farRefContainer) {
        var farRef;
        if ((enviroment.thisRef instanceof farRef_1.ServerFarReference) && farRefContainer.contactId == null) {
            //This is the first server side actor to come into contact with this client-side far reference and will henceforth be the contact point for all messages sent to this far reference
            farRef = new farRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.mainId, enviroment, enviroment.thisRef.ownerId, enviroment.thisRef.ownerAddress, enviroment.thisRef.ownerPort);
        }
        else {
            farRef = new farRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.mainId, enviroment, farRefContainer.contactId, farRefContainer.contactAddress, farRefContainer.contactPort);
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
        var deserialised = arrayContainer.values.map((valCont) => {
            return deserialise(valCont, enviroment);
        });
        return deserialised;
    }
    function deSerialiseIsolate(isolateContainer) {
        var isolate = reconstructObject(new spiders_1.Isolate(), JSON.parse(isolateContainer.vars), JSON.parse(isolateContainer.methods), enviroment);
        return isolate;
    }
    function deSerialiseIsolateDefinition(isolateDefContainer) {
        var classObj = eval(isolateDefContainer.definition);
        classObj.prototype[IsolateContainer.checkIsolateFuncKey] = true;
        return classObj;
    }
    function deSerialiseArrayIsolate(arrayIsolateContainer) {
        return new spiders_1.ArrayIsolate(arrayIsolateContainer.array);
    }
    function deSerialiseRepliq(repliqContainer) {
        let blankRepliq = new Repliq_1.Repliq();
        let fields = new Map();
        (JSON.parse(repliqContainer.primitiveFields)).forEach((repliqField) => {
            let field = new RepliqPrimitiveField_1.RepliqPrimitiveField(repliqField.name, repliqField.tentative);
            field.commited = repliqField.commited;
            field.read = constructMethod(repliqField.readFunc);
            field.writeField = constructMethod(repliqField.writeFunc);
            field.resetToCommit = constructMethod(repliqField.resetFunc);
            field.commit = constructMethod(repliqField.commitFunc);
            field.update = constructMethod(repliqField.updateFunc);
            fields.set(field.name, field);
        });
        (JSON.parse(repliqContainer.objectFields)).forEach((repliqField) => {
            let tentParsed = JSON.parse(repliqField.tentative);
            let comParsed = JSON.parse(repliqField.commited);
            let tentBase = {};
            Reflect.setPrototypeOf(tentBase, {});
            let comBase = {};
            Reflect.setPrototypeOf(comBase, {});
            let tentative = reconstructObject(tentBase, JSON.parse(tentParsed[0]), JSON.parse(tentParsed[1]), enviroment);
            let commited = reconstructObject(comBase, JSON.parse(comParsed[0]), JSON.parse(comParsed[1]), enviroment);
            let field = new RepliqObjectField_1.RepliqObjectField(repliqField.name, {});
            field.tentative = tentative;
            field.commited = commited;
            field.read = constructMethod(repliqField.readFunc);
            field.writeField = constructMethod(repliqField.writeFunc);
            field.resetToCommit = constructMethod(repliqField.resetFunc);
            field.commit = constructMethod(repliqField.commitFunc);
            field.update = constructMethod(repliqField.updateFunc);
            fields.set(field.name, field);
        });
        (JSON.parse(repliqContainer.innerRepFields)).forEach((innerRepliq) => {
            fields.set(innerRepliq.innerName, deserialise(innerRepliq, enviroment));
        });
        let methods = new Map();
        (JSON.parse(repliqContainer.methods)).forEach(([methodName, methodSource]) => {
            methods.set(methodName, constructMethod(methodSource));
        });
        let atomicMethods = new Map();
        (JSON.parse(repliqContainer.atomicMethods)).forEach(([methodName, methodSource]) => {
            atomicMethods.set(methodName, constructMethod(methodSource));
        });
        if (!repliqContainer.isClient && !enviroment.commMedium.hasConnection(repliqContainer.masterOwnerId)) {
            enviroment.commMedium.openConnection(repliqContainer.masterOwnerId, repliqContainer.ownerAddress, repliqContainer.ownerPort);
        }
        return blankRepliq.reconstruct(enviroment.gspInstance, repliqContainer.repliqId, repliqContainer.masterOwnerId, fields, methods, atomicMethods, repliqContainer.isClient, repliqContainer.ownerAddress, repliqContainer.ownerPort, repliqContainer.lastConfirmedRound);
    }
    function deSerialiseRepliqDefinition(def) {
        let index = def.definition.indexOf("{");
        let start = def.definition.substring(0, index);
        let stop = def.definition.substring(index, def.definition.length);
        let Repliq = require("./Replication/Repliq").Repliq;
        var classObj = eval(start + " extends Repliq" + stop);
        return classObj;
    }
    function deSerialiseSignal(sigContainer) {
        if (!enviroment.commMedium.hasConnection(sigContainer.ownerId)) {
            enviroment.commMedium.openConnection(sigContainer.ownerId, sigContainer.ownerAddress, sigContainer.ownerPort);
        }
        let signalId = sigContainer.id;
        let currentVal;
        if (sigContainer.obectValue) {
            let infoArr = sigContainer.currentValue;
            currentVal = reconstructObject(new signal_1.SignalObject(), JSON.parse(infoArr[0]), JSON.parse(infoArr[1]), enviroment);
        }
        else {
            let dummyFunc = new signal_1.SignalFunction(() => { });
            dummyFunc.lastVal = sigContainer.currentValue;
            currentVal = dummyFunc;
        }
        let signalProxy = new Signal(currentVal);
        signalProxy.rateLowerBound = sigContainer.rateLowerBound;
        signalProxy.rateUpperBound = sigContainer.rateUpperBound;
        signalProxy.clock = sigContainer.clock;
        signalProxy.id = signalId;
        signalProxy.value.setHolder(signalProxy);
        signalProxy.strong = sigContainer.strong;
        signalProxy.tempStrong = sigContainer.strong;
        let known = enviroment.signalPool.knownSignal(signalId);
        if (!known) {
            enviroment.signalPool.newSource(signalProxy);
            enviroment.commMedium.sendMessage(sigContainer.ownerId, new messages_1.RegisterExternalSignalMessage(enviroment.thisRef, enviroment.thisRef.ownerId, signalId, enviroment.thisRef.ownerAddress, enviroment.thisRef.ownerPort));
        }
        return signalProxy.value;
    }
    function deSerialiseSignalDefinition(def) {
        let index = def.definition.indexOf("{");
        let start = def.definition.substring(0, index);
        let stop = def.definition.substring(index, def.definition.length);
        let Signal = require("./Reactivivity/signal").SignalObject;
        var classObj = eval(start + " extends Signal" + stop);
        //TODO will need to store in some registry that certain methods of this class of signals are mutators (unable to change the definition with an annotation at this point)
        for (var i in Reflect.getPrototypeOf(classObj)) {
            console.log(i);
        }
        return classObj;
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
        case ValueContainer.repliqType:
            return deSerialiseRepliq(value);
        case ValueContainer.repliqDefinition:
            return deSerialiseRepliqDefinition(value);
        case ValueContainer.signalType:
            return deSerialiseSignal(value);
        case ValueContainer.signalDefinition:
            return deSerialiseSignalDefinition(value);
        default:
            throw "Unknown value container type :  " + value.type;
    }
}
exports.deserialise = deserialise;
//# sourceMappingURL=serialisation.js.map