"use strict";
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("./messages");
var farRef_1 = require("./farRef");
var spiders_1 = require("./spiders");
var Repliq_1 = require("./Replication/Repliq");
var RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
var RepliqObjectField_1 = require("./Replication/RepliqObjectField");
var signal_1 = require("./Reactivivity/signal");
var Signal = require("./Reactivivity/signal").Signal;
/**
 * Created by flo on 19/12/2016.
 */
//Enables to detect true type of instances (e.g. array)
function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
function getObjectVars(object, receiverId, environment, ignoreSet) {
    if (ignoreSet === void 0) { ignoreSet = []; }
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
        keys.forEach(function (key) {
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
    staticProperties.forEach(function (propertyArray) {
        var className = propertyArray[0];
        var stub = {};
        var vars = propertyArray[1];
        var methods = propertyArray[2];
        vars.forEach(function (varPair) {
            var key = varPair[0];
            var val = deserialise(varPair[1], environment);
            stub[key] = val;
        });
        methods.forEach(function (methodPair) {
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
    variables.forEach(function (levelVariables) {
        var installIn = getProtoForLevel(levelVariables[0], baseObject);
        levelVariables.shift();
        levelVariables.forEach(function (varEntry) {
            var key = varEntry[0];
            var rawVal = varEntry[1];
            var val = deserialise(rawVal, environment);
            installIn[key] = val;
        });
    });
    methods.forEach(function (levelMethods) {
        var installIn = getProtoForLevel(levelMethods[0], baseObject);
        levelMethods.shift();
        levelMethods.forEach(function (methodEntry) {
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
    variables.forEach(function (varEntry) {
        var key = varEntry[0];
        var rawVal = varEntry[1];
        var val = deserialise(rawVal, environment);
        baseObject[key] = val;
    });
    methods.forEach(function (methodEntry) {
        var key = methodEntry[0];
        var functionSource = methodEntry[1];
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
    ValueContainer.repliqType = 9;
    ValueContainer.repliqFieldType = 10;
    ValueContainer.repliqDefinition = 11;
    ValueContainer.signalType = 12;
    ValueContainer.signalDefinition = 13;
    return ValueContainer;
}());
exports.ValueContainer = ValueContainer;
var NativeContainer = (function (_super) {
    __extends(NativeContainer, _super);
    function NativeContainer(value) {
        var _this = _super.call(this, ValueContainer.nativeType) || this;
        _this.value = value;
        return _this;
    }
    return NativeContainer;
}(ValueContainer));
exports.NativeContainer = NativeContainer;
var PromiseContainer = (function (_super) {
    __extends(PromiseContainer, _super);
    function PromiseContainer(promiseId, promiseCreatorId) {
        var _this = _super.call(this, ValueContainer.promiseType) || this;
        _this.promiseId = promiseId;
        _this.promiseCreatorId = promiseCreatorId;
        return _this;
    }
    return PromiseContainer;
}(ValueContainer));
exports.PromiseContainer = PromiseContainer;
var ServerFarRefContainer = (function (_super) {
    __extends(ServerFarRefContainer, _super);
    function ServerFarRefContainer(objectId, ownerId, ownerAddress, ownerPort) {
        var _this = _super.call(this, ValueContainer.serverFarRefType) || this;
        _this.objectId = objectId;
        _this.ownerId = ownerId;
        _this.ownerAddress = ownerAddress;
        _this.ownerPort = ownerPort;
        return _this;
    }
    return ServerFarRefContainer;
}(ValueContainer));
exports.ServerFarRefContainer = ServerFarRefContainer;
var ClientFarRefContainer = (function (_super) {
    __extends(ClientFarRefContainer, _super);
    function ClientFarRefContainer(objectId, ownerId, mainId, contactId, contactAddress, contactPort) {
        var _this = _super.call(this, ValueContainer.clientFarRefType) || this;
        _this.objectId = objectId;
        _this.ownerId = ownerId;
        _this.mainId = mainId;
        _this.contactId = contactId;
        _this.contactAddress = contactAddress;
        _this.contactPort = contactPort;
        return _this;
    }
    return ClientFarRefContainer;
}(ValueContainer));
exports.ClientFarRefContainer = ClientFarRefContainer;
var ErrorContainer = (function (_super) {
    __extends(ErrorContainer, _super);
    function ErrorContainer(error) {
        var _this = _super.call(this, ValueContainer.errorType) || this;
        _this.message = error.message;
        _this.stack = error.stack;
        _this.name = error.name;
        return _this;
    }
    return ErrorContainer;
}(ValueContainer));
exports.ErrorContainer = ErrorContainer;
var ArrayContainer = (function (_super) {
    __extends(ArrayContainer, _super);
    function ArrayContainer(values) {
        var _this = _super.call(this, ValueContainer.arrayType) || this;
        _this.values = values;
        return _this;
    }
    return ArrayContainer;
}(ValueContainer));
exports.ArrayContainer = ArrayContainer;
var IsolateContainer = (function (_super) {
    __extends(IsolateContainer, _super);
    function IsolateContainer(vars, methods) {
        var _this = _super.call(this, ValueContainer.isolateType) || this;
        _this.vars = vars;
        _this.methods = methods;
        return _this;
    }
    IsolateContainer.checkIsolateFuncKey = "_INSTANCEOF_ISOLATE_";
    return IsolateContainer;
}(ValueContainer));
exports.IsolateContainer = IsolateContainer;
var IsolateDefinitionContainer = (function (_super) {
    __extends(IsolateDefinitionContainer, _super);
    function IsolateDefinitionContainer(definition) {
        var _this = _super.call(this, ValueContainer.isolateDefType) || this;
        _this.definition = definition;
        return _this;
    }
    return IsolateDefinitionContainer;
}(ValueContainer));
exports.IsolateDefinitionContainer = IsolateDefinitionContainer;
var ArrayIsolateContainer = (function (_super) {
    __extends(ArrayIsolateContainer, _super);
    function ArrayIsolateContainer(array) {
        var _this = _super.call(this, ValueContainer.arrayIsolateType) || this;
        _this.array = array;
        return _this;
    }
    ArrayIsolateContainer.checkArrayIsolateFuncKey = "_INSTANCEOF_ARRAY_ISOLATE_";
    return ArrayIsolateContainer;
}(ValueContainer));
exports.ArrayIsolateContainer = ArrayIsolateContainer;
var RepliqContainer = (function (_super) {
    __extends(RepliqContainer, _super);
    function RepliqContainer(primitiveFields, objectFields, innerRepFields, methods, atomicMethods, repliqId, masterOwnerId, isClient, ownerAddress, ownerPort, lastConfirmedRound, innerName) {
        if (innerName === void 0) { innerName = ""; }
        var _this = _super.call(this, ValueContainer.repliqType) || this;
        _this.primitiveFields = primitiveFields;
        _this.objectFields = objectFields;
        _this.innerRepFields = innerRepFields;
        _this.innerName = innerName;
        _this.methods = methods;
        _this.atomicMethods = atomicMethods;
        _this.repliqId = repliqId;
        _this.masterOwnerId = masterOwnerId;
        _this.isClient = isClient;
        _this.ownerAddress = ownerAddress;
        _this.ownerPort = ownerPort;
        _this.lastConfirmedRound = lastConfirmedRound;
        return _this;
    }
    RepliqContainer.checkRepliqFuncKey = "_INSTANCEOF_REPLIQ_";
    return RepliqContainer;
}(ValueContainer));
exports.RepliqContainer = RepliqContainer;
var RepliqFieldContainer = (function (_super) {
    __extends(RepliqFieldContainer, _super);
    function RepliqFieldContainer(name, tentative, commited, readFunc, writeFunc, resetFunc, commitFunc, updateFunc) {
        var _this = _super.call(this, ValueContainer.repliqFieldType) || this;
        _this.name = name;
        _this.tentative = tentative;
        _this.commited = commited;
        _this.readFunc = readFunc;
        _this.writeFunc = writeFunc;
        _this.resetFunc = resetFunc;
        _this.commitFunc = commitFunc;
        _this.updateFunc = updateFunc;
        return _this;
    }
    return RepliqFieldContainer;
}(ValueContainer));
var RepliqDefinitionContainer = (function (_super) {
    __extends(RepliqDefinitionContainer, _super);
    function RepliqDefinitionContainer(definition) {
        var _this = _super.call(this, ValueContainer.repliqDefinition) || this;
        _this.definition = definition;
        return _this;
    }
    return RepliqDefinitionContainer;
}(ValueContainer));
exports.RepliqDefinitionContainer = RepliqDefinitionContainer;
//When a signal is serialised and passed to another actor it can implicitly only depend on the original signal
//From the moment the signal is deserialised on the receiving side it will act as a source for that actor
//Hence, all the information needed is the signal's id and its current value
var SignalContainer = (function (_super) {
    __extends(SignalContainer, _super);
    function SignalContainer(id, objectValue, currentValue, rateLowerBound, rateUpperBound, clock, strong, ownerId, ownerAddress, ownerPort) {
        var _this = _super.call(this, ValueContainer.signalType) || this;
        _this.id = id;
        _this.obectValue = objectValue;
        _this.currentValue = currentValue;
        _this.rateLowerBound = rateLowerBound;
        _this.rateUpperBound = rateUpperBound;
        _this.clock = clock;
        _this.strong = strong;
        _this.ownerId = ownerId;
        _this.ownerAddress = ownerAddress;
        _this.ownerPort = ownerPort;
        return _this;
    }
    SignalContainer.checkSignalFuncKey = "_INSTANCEOF_Signal_";
    return SignalContainer;
}(ValueContainer));
exports.SignalContainer = SignalContainer;
var SignalDefinitionContainer = (function (_super) {
    __extends(SignalDefinitionContainer, _super);
    function SignalDefinitionContainer(definition, mutators) {
        var _this = _super.call(this, ValueContainer.signalDefinition) || this;
        _this.definition = definition;
        _this.mutators = mutators;
        return _this;
    }
    return SignalDefinitionContainer;
}(ValueContainer));
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
    promise.then(function (val) {
        enviroment.commMedium.sendMessage(receiverId, new messages_1.ResolvePromiseMessage(enviroment.thisRef, wrapper.promiseId, serialise(val, receiverId, enviroment), true));
    });
    promise.catch(function (reason) {
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
    var primitives = [];
    var objects = [];
    var innerReps = [];
    var ret = [primitives, objects, innerReps];
    fields.forEach(function (repliqField, fieldName) {
        if (repliqField instanceof RepliqPrimitiveField_1.RepliqPrimitiveField) {
            primitives.push(new RepliqFieldContainer(fieldName, repliqField.tentative, repliqField.commited, repliqField.read.toString(), repliqField.writeField.toString(), repliqField.resetToCommit.toString(), repliqField.commit.toString(), repliqField.update.toString()));
        }
        else if (repliqField instanceof RepliqObjectField_1.RepliqObjectField) {
            var field = repliqField;
            var tentMethods = void 0;
            var commMethods = void 0;
            //Avoid copying over Object prototype methods containing native javascript code (cannot be evalled by deserialiser)
            if (Object.getPrototypeOf(field.tentative) == Object.getPrototypeOf({})) {
                tentMethods = [];
                commMethods = [];
            }
            else {
                tentMethods = getObjectMethods(field.tentative);
                commMethods = getObjectMethods(field.commited);
            }
            var tentative = JSON.stringify([JSON.stringify(getObjectVars(field.tentative, receiverId, environment)), JSON.stringify(tentMethods)]);
            var commited = JSON.stringify([JSON.stringify(getObjectVars(field.commited, receiverId, environment)), JSON.stringify(commMethods)]);
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
function serialiseRepliq(repliqProxy, receiverId, environment, innerName) {
    if (innerName === void 0) { innerName = ""; }
    var fields = repliqProxy[Repliq_1.Repliq.getRepliqFields];
    var fieldsArr = serialiseRepliqFields(fields, receiverId, environment);
    var primitiveFields = fieldsArr[0];
    var objectFields = fieldsArr[1];
    var innerReps = fieldsArr[2];
    var methods = repliqProxy[Repliq_1.Repliq.getRepliqOriginalMethods];
    var methodArr = [];
    var atomicArr = [];
    methods.forEach(function (method, methodName) {
        if (method[Repliq_1.Repliq.isAtomic]) {
            atomicArr.push([methodName, method.toString()]);
        }
        else {
            methodArr.push([methodName, method.toString()]);
        }
    });
    var repliqId = repliqProxy[Repliq_1.Repliq.getRepliqID];
    var repliqOwnerId = repliqProxy[Repliq_1.Repliq.getRepliqOwnerID];
    var isClient = repliqProxy[Repliq_1.Repliq.isClientMaster];
    var ownerAddress = repliqProxy[Repliq_1.Repliq.getRepliqOwnerAddress];
    var ownerPort = repliqProxy[Repliq_1.Repliq.getRepliqOwnerPort];
    var roundNr;
    //Possible that repliq has not yet been modified at serialisation time
    if (environment.gspInstance.roundNumbers.has(repliqId)) {
        roundNr = environment.gspInstance.roundNumbers.get(repliqId);
    }
    else {
        roundNr = 0;
    }
    var ret = new RepliqContainer(JSON.stringify(primitiveFields), JSON.stringify(objectFields), JSON.stringify(innerReps), JSON.stringify(methodArr), JSON.stringify(atomicArr), repliqId, repliqOwnerId, isClient, ownerAddress, ownerPort, roundNr, innerName);
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
            var farRef_2 = value[farRef_1.FarReference.farRefAccessorKey];
            if (environment.thisRef instanceof farRef_1.ServerFarReference && farRef_2.contactId == null) {
                //Current actor is a server and is the first to obtain a reference to this client actor. conversation with this client should now be rooted through this actor given that it has a socket reference to it
                return new ClientFarRefContainer(farRef_2.objectId, farRef_2.ownerId, farRef_2.mainId, environment.thisRef.ownerId, environment.thisRef.ownerAddress, environment.thisRef.ownerPort);
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
            var sig_1 = (value.holder);
            if (!sig_1.isGarbage) {
                var isValueObject = sig_1.value instanceof signal_1.SignalObject;
                var val = void 0;
                if (isValueObject) {
                    var vars_1 = getObjectVars(sig_1.value, receiverId, environment, ["holder"]);
                    var methods_1 = getObjectMethods(sig_1.value);
                    //No need to keep track of which methods are mutators during serialisation. Only owner can mutate and change/propagate!
                    methods_1.forEach(function (methodArr, index) {
                        var name = methodArr[0];
                        if (sig_1.value[name][signal_1.SignalValue.IS_MUTATOR]) {
                            var sigProto = Object.getPrototypeOf(sig_1.value);
                            var method = Reflect.get(sigProto, name);
                            //console.log("Original method: " + method[SignalValue.GET_ORIGINAL].toString())
                            methods_1[index] = [name, method[signal_1.SignalValue.GET_ORIGINAL].toString()];
                        }
                    });
                    val = [JSON.stringify(vars_1), JSON.stringify(methods_1)];
                }
                else {
                    //Only way that value isn't an object is if it is the result of a lifted function
                    val = sig_1.value.lastVal;
                }
                return new SignalContainer(sig_1.id, isValueObject, val, sig_1.rateLowerBound, sig_1.rateUpperBound, sig_1.clock, sig_1.tempStrong, environment.thisRef.ownerId, environment.thisRef.ownerAddress, environment.thisRef.ownerPort);
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
            var mutators_1 = [];
            //Need to find out which of the definition's methods are mutating. Can only do this on an instantiated object
            var dummy_1 = new value();
            var methodKeys = Reflect.ownKeys(Object.getPrototypeOf(dummy_1));
            methodKeys.forEach(function (methodName) {
                var property = Reflect.get(Object.getPrototypeOf(dummy_1), methodName);
                if (property[signal_1.SignalValue.IS_MUTATOR]) {
                    mutators_1.push(methodName);
                }
            });
            return new SignalDefinitionContainer(definition, mutators_1);
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
        var deserialised = arrayContainer.values.map(function (valCont) {
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
        var blankRepliq = new Repliq_1.Repliq();
        var fields = new Map();
        (JSON.parse(repliqContainer.primitiveFields)).forEach(function (repliqField) {
            var field = new RepliqPrimitiveField_1.RepliqPrimitiveField(repliqField.name, repliqField.tentative);
            field.commited = repliqField.commited;
            field.read = constructMethod(repliqField.readFunc);
            field.writeField = constructMethod(repliqField.writeFunc);
            field.resetToCommit = constructMethod(repliqField.resetFunc);
            field.commit = constructMethod(repliqField.commitFunc);
            field.update = constructMethod(repliqField.updateFunc);
            fields.set(field.name, field);
        });
        (JSON.parse(repliqContainer.objectFields)).forEach(function (repliqField) {
            var tentParsed = JSON.parse(repliqField.tentative);
            var comParsed = JSON.parse(repliqField.commited);
            var tentBase = {};
            Reflect.setPrototypeOf(tentBase, {});
            var comBase = {};
            Reflect.setPrototypeOf(comBase, {});
            var tentative = reconstructObject(tentBase, JSON.parse(tentParsed[0]), JSON.parse(tentParsed[1]), enviroment);
            var commited = reconstructObject(comBase, JSON.parse(comParsed[0]), JSON.parse(comParsed[1]), enviroment);
            var field = new RepliqObjectField_1.RepliqObjectField(repliqField.name, {});
            field.tentative = tentative;
            field.commited = commited;
            field.read = constructMethod(repliqField.readFunc);
            field.writeField = constructMethod(repliqField.writeFunc);
            field.resetToCommit = constructMethod(repliqField.resetFunc);
            field.commit = constructMethod(repliqField.commitFunc);
            field.update = constructMethod(repliqField.updateFunc);
            fields.set(field.name, field);
        });
        (JSON.parse(repliqContainer.innerRepFields)).forEach(function (innerRepliq) {
            fields.set(innerRepliq.innerName, deserialise(innerRepliq, enviroment));
        });
        var methods = new Map();
        (JSON.parse(repliqContainer.methods)).forEach(function (_a) {
            var methodName = _a[0], methodSource = _a[1];
            methods.set(methodName, constructMethod(methodSource));
        });
        var atomicMethods = new Map();
        (JSON.parse(repliqContainer.atomicMethods)).forEach(function (_a) {
            var methodName = _a[0], methodSource = _a[1];
            atomicMethods.set(methodName, constructMethod(methodSource));
        });
        if (!repliqContainer.isClient && !enviroment.commMedium.hasConnection(repliqContainer.masterOwnerId)) {
            enviroment.commMedium.openConnection(repliqContainer.masterOwnerId, repliqContainer.ownerAddress, repliqContainer.ownerPort);
        }
        return blankRepliq.reconstruct(enviroment.gspInstance, repliqContainer.repliqId, repliqContainer.masterOwnerId, fields, methods, atomicMethods, repliqContainer.isClient, repliqContainer.ownerAddress, repliqContainer.ownerPort, repliqContainer.lastConfirmedRound);
    }
    function deSerialiseRepliqDefinition(def) {
        var index = def.definition.indexOf("{");
        var start = def.definition.substring(0, index);
        var stop = def.definition.substring(index, def.definition.length);
        var Repliq = require("./Replication/Repliq").Repliq;
        var classObj = eval(start + " extends Repliq" + stop);
        return classObj;
    }
    function deSerialiseSignal(sigContainer) {
        if (!enviroment.commMedium.hasConnection(sigContainer.ownerId)) {
            enviroment.commMedium.openConnection(sigContainer.ownerId, sigContainer.ownerAddress, sigContainer.ownerPort);
        }
        var signalId = sigContainer.id;
        var currentVal;
        if (sigContainer.obectValue) {
            var infoArr = sigContainer.currentValue;
            currentVal = reconstructObject(new signal_1.SignalObject(), JSON.parse(infoArr[0]), JSON.parse(infoArr[1]), enviroment);
        }
        else {
            var dummyFunc = new signal_1.SignalFunction(function () { });
            dummyFunc.lastVal = sigContainer.currentValue;
            currentVal = dummyFunc;
        }
        var signalProxy = new Signal(currentVal);
        signalProxy.rateLowerBound = sigContainer.rateLowerBound;
        signalProxy.rateUpperBound = sigContainer.rateUpperBound;
        signalProxy.clock = sigContainer.clock;
        signalProxy.id = signalId;
        signalProxy.value.setHolder(signalProxy);
        signalProxy.strong = sigContainer.strong;
        signalProxy.tempStrong = sigContainer.strong;
        var known = enviroment.signalPool.knownSignal(signalId);
        if (!known) {
            enviroment.signalPool.newSource(signalProxy);
            enviroment.commMedium.sendMessage(sigContainer.ownerId, new messages_1.RegisterExternalSignalMessage(enviroment.thisRef, enviroment.thisRef.ownerId, signalId, enviroment.thisRef.ownerAddress, enviroment.thisRef.ownerPort));
        }
        return signalProxy.value;
    }
    function deSerialiseSignalDefinition(def) {
        var index = def.definition.indexOf("{");
        var start = def.definition.substring(0, index);
        var stop = def.definition.substring(index, def.definition.length);
        var Signal = require("./Reactivivity/signal").SignalObject;
        var classObj = eval(start + " extends Signal" + stop);
        var mutators = def.mutators;
        //Create a dummy signal instance to get the class name
        var dummy = new classObj();
        mutators.forEach(function (mutator) {
            enviroment.signalPool.addMutator(dummy.constructor.name, mutator);
        });
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
