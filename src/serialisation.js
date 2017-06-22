///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("./messages");
const farRef_1 = require("./farRef");
const spiders_1 = require("./spiders");
const Repliq_1 = require("./Replication/Repliq");
const RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
const RepliqObjectField_1 = require("./Replication/RepliqObjectField");
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
        keys.forEach((key) => {
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
function reconstructStatic(behaviourObject, staticProperties, thisRef, promisePool, commMedium, objectPool, gspInstance) {
    staticProperties.forEach((propertyArray) => {
        var className = propertyArray[0];
        var stub = {};
        var vars = propertyArray[1];
        var methods = propertyArray[2];
        vars.forEach((varPair) => {
            var key = varPair[0];
            var val = deserialise(thisRef, varPair[1], promisePool, commMedium, objectPool, gspInstance);
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
function deconstructBehaviour(object, currentLevel, accumVars, accumMethods, thisRef, receiverId, commMedium, promisePool, objectPool) {
    var properties = Reflect.ownKeys(object);
    var localAccumVars = [];
    for (var i in properties) {
        var key = properties[i];
        var val = Reflect.get(object, key);
        if (typeof val != 'function' || isIsolateClass(val) || isRepliqClass(val)) {
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
function reconstructBehaviour(baseObject, variables, methods, thisRef, promisePool, commMedium, objectPool, gspInstance) {
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
            var val = deserialise(thisRef, rawVal, promisePool, commMedium, objectPool, gspInstance);
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
function reconstructObject(baseObject, variables, methods, thisRef, promisePool, commMedium, objectPool, gspInstance) {
    variables.forEach((varEntry) => {
        var key = varEntry[0];
        var rawVal = varEntry[1];
        var val = deserialise(thisRef, rawVal, promisePool, commMedium, objectPool, gspInstance);
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
    constructor(primitiveFields, objectFields, innerRepFields, methods, atomicMethods, repliqId, masterOwnerId, isClient, ownerAddress, ownerPort, innerName = "") {
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
class SignalContainer extends ValueContainer {
}
//TODO
SignalContainer.checkSignalFuncKey = "_INSTANCEOF_Signal_";
exports.SignalContainer = SignalContainer;
function isClass(func) {
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}
function isIsolateClass(func) {
    return (func.toString().search(/extends.*?Isolate/) != -1);
}
function isRepliqClass(func) {
    return (func.toString().search(/extends.*?Repliq/) != -1);
}
function serialisePromise(promise, thisRef, receiverId, commMedium, promisePool, objectPool) {
    var wrapper = promisePool.newPromise();
    promise.then((val) => {
        commMedium.sendMessage(receiverId, new messages_1.ResolvePromiseMessage(thisRef, wrapper.promiseId, serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool), true));
    });
    promise.catch((reason) => {
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
function serialiseRepliqFields(fields, thisRef, receiverId, commMedium, promisePool, objectPool) {
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
            let tentative = JSON.stringify([JSON.stringify(getObjectVars(field.tentative, thisRef, receiverId, commMedium, promisePool, objectPool)), JSON.stringify(tentMethods)]);
            let commited = JSON.stringify([JSON.stringify(getObjectVars(field.commited, thisRef, receiverId, commMedium, promisePool, objectPool)), JSON.stringify(commMethods)]);
            objects.push(new RepliqFieldContainer(fieldName, tentative, commited, field.read.toString(), field.writeField.toString(), field.resetToCommit.toString(), field.commit.toString(), field.update.toString()));
        }
        else if (repliqField[RepliqContainer.checkRepliqFuncKey]) {
            innerReps.push(serialiseRepliq(repliqField, thisRef, receiverId, commMedium, promisePool, objectPool, fieldName));
        }
        else {
            throw new Error("Unknown Repliq field type in serialisation");
        }
    });
    return ret;
}
function serialiseRepliq(repliqProxy, thisRef, receiverId, commMedium, promisePool, objectPool, innerName = "") {
    let fields = repliqProxy[Repliq_1.Repliq.getRepliqFields];
    let fieldsArr = serialiseRepliqFields(fields, thisRef, receiverId, commMedium, promisePool, objectPool);
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
    let ret = new RepliqContainer(JSON.stringify(primitiveFields), JSON.stringify(objectFields), JSON.stringify(innerReps), JSON.stringify(methodArr), JSON.stringify(atomicArr), repliqId, repliqOwnerId, isClient, ownerAddress, ownerPort, innerName);
    //This actor is the first to serialise this Repliq, set the address and port to this actor
    if (thisRef instanceof farRef_1.ServerFarReference && ret.ownerAddress == null) {
        ret.ownerAddress = thisRef.ownerAddress;
        ret.ownerPort = thisRef.ownerPort;
        ret.isClient = false;
    }
    else {
        //TODO
    }
    return ret;
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
            let farRef = value[farRef_1.FarReference.farRefAccessorKey];
            if (thisRef instanceof farRef_1.ServerFarReference && farRef.contactId == null) {
                //Current actor is a server and is the first to obtain a reference to this client actor. conversation with this client should now be rooted through this actor given that it has a socket reference to it
                return new ClientFarRefContainer(farRef.objectId, farRef.ownerId, farRef.mainId, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
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
                return serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool);
            });
            return new ArrayContainer(values);
        }
        else if (value[IsolateContainer.checkIsolateFuncKey]) {
            var vars = getObjectVars(value, thisRef, receiverId, commMedium, promisePool, objectPool);
            var methods = getObjectMethods(value);
            return new IsolateContainer(JSON.stringify(vars), JSON.stringify(methods));
        }
        else if (value[RepliqContainer.checkRepliqFuncKey]) {
            return serialiseRepliq(value, thisRef, receiverId, commMedium, promisePool, objectPool);
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
        else if (isClass(value) && isRepliqClass(value)) {
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            return new RepliqDefinitionContainer(definition);
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
function deserialise(thisRef, value, promisePool, commMedium, objectPool, gspInstance) {
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
        var deserialised = arrayContainer.values.map((valCont) => {
            return deserialise(thisRef, valCont, promisePool, commMedium, objectPool, gspInstance);
        });
        return deserialised;
    }
    function deSerialiseIsolate(isolateContainer) {
        var isolate = reconstructObject(new spiders_1.Isolate(), JSON.parse(isolateContainer.vars), JSON.parse(isolateContainer.methods), thisRef, promisePool, commMedium, objectPool, gspInstance);
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
            let tentative = reconstructObject(tentBase, JSON.parse(tentParsed[0]), JSON.parse(tentParsed[1]), thisRef, promisePool, commMedium, objectPool, gspInstance);
            let commited = reconstructObject(comBase, JSON.parse(comParsed[0]), JSON.parse(comParsed[1]), thisRef, promisePool, commMedium, objectPool, gspInstance);
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
            fields.set(innerRepliq.innerName, deserialise(thisRef, innerRepliq, promisePool, commMedium, objectPool, gspInstance));
        });
        let methods = new Map();
        (JSON.parse(repliqContainer.methods)).forEach(([methodName, methodSource]) => {
            methods.set(methodName, constructMethod(methodSource));
        });
        let atomicMethods = new Map();
        (JSON.parse(repliqContainer.atomicMethods)).forEach(([methodName, methodSource]) => {
            atomicMethods.set(methodName, constructMethod(methodSource));
        });
        if (repliqContainer.isClient) {
            //TODO
        }
        else {
            if (!commMedium.hasConnection(repliqContainer.masterOwnerId)) {
                commMedium.openConnection(repliqContainer.masterOwnerId, repliqContainer.ownerAddress, repliqContainer.ownerPort);
            }
        }
        return blankRepliq.reconstruct(gspInstance, repliqContainer.repliqId, repliqContainer.masterOwnerId, fields, methods, atomicMethods, repliqContainer.isClient, repliqContainer.ownerAddress, repliqContainer.ownerPort);
    }
    function deSerialiseRepliqDefinition(def) {
        let index = def.definition.indexOf("{");
        let start = def.definition.substring(0, index);
        let stop = def.definition.substring(index, def.definition.length);
        let Repliq = require("./Replication/Repliq").Repliq;
        var classObj = eval(start + " extends Repliq" + stop);
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
        default:
            throw "Unknown value container type :  " + value.type;
    }
}
exports.deserialise = deserialise;
//# sourceMappingURL=serialisation.js.map