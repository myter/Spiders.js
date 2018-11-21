Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("./Message");
const FarRef_1 = require("./FarRef");
const utils_1 = require("./utils");
const MOP_1 = require("./MOP");
/**
 * Created by flo on 19/12/2016.
 */
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
function getObjectNames(object, lastProp, accumVars = [], accumMethods = []) {
    var properties = Reflect.ownKeys(object);
    var lastProto = properties.indexOf(lastProp) != -1;
    if (lastProto) {
        return [accumVars, accumMethods];
    }
    else {
        for (var i in properties) {
            let key = properties[i];
            let val = Reflect.get(object, key);
            let k = key.toString();
            if (typeof val == 'function') {
                if (!accumMethods.includes(k)) {
                    accumMethods.push(k);
                }
            }
            else {
                if (!accumVars.includes(k)) {
                    accumVars.push(k);
                }
            }
        }
        return getObjectNames(Reflect.getPrototypeOf(object), lastProp, accumVars, accumMethods);
    }
}
exports.getObjectNames = getObjectNames;
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
function convert(inputString) {
    let reg = new RegExp(/(super\.)(.*?\()((.|[\r\n])*)/);
    //let parts   = inputString.match(/(super\.)(.*?\()((.|[\r\n])*)/)
    let parts = inputString.match(reg);
    parts[2] = parts[2].replace('(', '.bind(this)(');
    let prefix = inputString.substring(0, parts.index);
    if (parts[3].match(reg)) {
        return prefix + parts[1] + parts[2] + convert(parts[3]);
    }
    else {
        return prefix + parts[1] + parts[2] + parts[3];
    }
}
function constructMethod(functionSource) {
    //JS disallows the use of super outside of method context (which is the case if you eval a function as a string)
    //Replace all supers with proto calls
    if (functionSource.includes("super")) {
        functionSource = convert(functionSource);
        functionSource = functionSource.replace(new RegExp("super", 'g'), "((this.__proto__).__proto__)");
    }
    if (functionSource.startsWith("function")) {
        var method = eval("(" + functionSource + ")");
    }
    else if (functionSource.startsWith("(")) {
        var method = eval(functionSource);
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
function deconstructBehaviour(object, currentLevel, accumVars, accumMethods, accumMethodAnnots, receiverId, environment, lastProp) {
    var properties = Reflect.ownKeys(object);
    var localAccumVars = [];
    for (var i in properties) {
        var key = properties[i];
        var val = Reflect.get(object, key);
        /*if((typeof val != 'function' || isSpiderObjectClass(val) || isSpiderIsolateClass(val) || isObjectMirrorClass(val) || isIsolateMirrorClass(val) || isRepliqClass(val) || isSignalClass(val)) && key != "constructor"){
            var serialisedval   = serialise(val,receiverId,environment)
            localAccumVars.push([key,serialisedval])
        }*/
        if ((typeof val != 'function' || isClass(val)) && key != "constructor") {
            var serialisedval = serialise(val, receiverId, environment);
            localAccumVars.push([key, serialisedval]);
        }
    }
    localAccumVars.unshift(currentLevel);
    accumVars.push(localAccumVars);
    var localAccumMethods = [];
    var localAccumMethAnnot = [];
    var proto = Reflect.getPrototypeOf(object);
    properties = Reflect.ownKeys(proto);
    var lastProto = properties.indexOf(lastProp) != -1;
    if (!lastProto) {
        for (var i in properties) {
            var key = properties[i];
            var method = Reflect.get(proto, key);
            if (typeof method == 'function' && key != "constructor") {
                if (utils_1.isAnnotatedMethod(method)) {
                    localAccumMethAnnot.push([key, method["_ANNOT_CALL_"].toString(), method["_ANNOT_TAG_"]]);
                }
                localAccumMethods.push([key, method.toString()]);
            }
        }
        localAccumMethods.unshift(currentLevel + 1);
        localAccumMethAnnot.unshift(currentLevel + 1);
        accumMethods.push(localAccumMethods);
        accumMethodAnnots.push(localAccumMethAnnot);
        return deconstructBehaviour(proto, currentLevel + 1, accumVars, accumMethods, accumMethodAnnots, receiverId, environment, lastProp);
    }
    else {
        return [accumVars, accumMethods, accumMethodAnnots];
    }
}
exports.deconstructBehaviour = deconstructBehaviour;
function reconstructBehaviour(baseObject, variables, methods, methodAnnotations, environment) {
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
    methodAnnotations.forEach((levelAnnotations) => {
        let installIn = getProtoForLevel(levelAnnotations[0], baseObject);
        levelAnnotations.shift();
        levelAnnotations.forEach((annot) => {
            let methName = annot[0];
            let annotF = annot[1];
            let annotTag = annot[2];
            let meth = installIn[methName];
            meth["_ANNOT_CALL_"] = constructMethod(annotF);
            meth["_ANNOT_TAG_"] = annotTag;
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
ValueContainer.repliqType = 9;
ValueContainer.repliqFieldType = 10;
ValueContainer.repliqDefinition = 11;
ValueContainer.signalType = 12;
ValueContainer.signalDefinition = 13;
ValueContainer.spiderObjectDef = 14;
ValueContainer.objectMirrorDef = 15;
ValueContainer.spiderIsolDef = 16;
ValueContainer.isolMirrorDef = 17;
ValueContainer.classDefType = 18;
ValueContainer.mapType = 19;
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
    constructor(objectId, objectFields, objectMethods, ownerId, ownerAddress, ownerPort) {
        super(ValueContainer.serverFarRefType);
        this.objectId = objectId;
        this.objectFields = objectFields;
        this.objectMethods = objectMethods;
        this.ownerId = ownerId;
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
}
exports.ServerFarRefContainer = ServerFarRefContainer;
class ClientFarRefContainer extends ValueContainer {
    constructor(objectId, objectFields, objectMethods, ownerId, mainId, contactId, contactAddress, contactPort) {
        super(ValueContainer.clientFarRefType);
        this.objectId = objectId;
        this.objectFields = objectFields;
        this.objectMethods = objectMethods;
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
class SpiderObjectDefinitionContainer extends ValueContainer {
    constructor(definitions, scopes, methodAnnotations) {
        super(ValueContainer.spiderObjectDef);
        this.definitions = definitions;
        this.scopes = scopes;
        this.methodAnnot = methodAnnotations;
    }
}
exports.SpiderObjectDefinitionContainer = SpiderObjectDefinitionContainer;
class SpiderIsolateDefinitionContainer extends ValueContainer {
    constructor(definitions, scopes, methodAnnotations) {
        super(ValueContainer.spiderIsolDef);
        this.definitions = definitions;
        this.scopes = scopes;
        this.methodAnnot = methodAnnotations;
    }
}
exports.SpiderIsolateDefinitionContainer = SpiderIsolateDefinitionContainer;
class SpiderIsolateContainer extends ValueContainer {
    constructor(vars, methods, methAnnots, mirrorVars, mirrorMethods, mirrorMethAnnots) {
        super(ValueContainer.isolateType);
        this.vars = vars;
        this.methods = methods;
        this.methAnnots = methAnnots;
        this.mirrorVars = mirrorVars;
        this.mirrorMethods = mirrorMethods;
        this.mirrorMethAnnots = mirrorMethAnnots;
    }
}
SpiderIsolateContainer.checkIsolateFuncKey = "_INSTANCEOF_ISOLATE_";
exports.SpiderIsolateContainer = SpiderIsolateContainer;
class SpiderObjectMirrorDefinitionContainer extends ValueContainer {
    constructor(definitions, scopes, methodAnnotations) {
        super(ValueContainer.objectMirrorDef);
        this.definitions = definitions;
        this.scopes = scopes;
        this.methodAnnot = methodAnnotations;
    }
}
exports.SpiderObjectMirrorDefinitionContainer = SpiderObjectMirrorDefinitionContainer;
class SpiderIsolateMirrorDefinitionContainer extends ValueContainer {
    constructor(definitions, scopes, methodAnnotations) {
        super(ValueContainer.isolMirrorDef);
        this.definitions = definitions;
        this.scopes = scopes;
        this.methodAnnot = methodAnnotations;
    }
}
exports.SpiderIsolateMirrorDefinitionContainer = SpiderIsolateMirrorDefinitionContainer;
class ClassDefinitionContainer extends ValueContainer {
    constructor(definitions, scopes, methodAnnotations) {
        super(ValueContainer.classDefType);
        this.definitions = definitions;
        this.scopes = scopes;
        this.methodAnnot = methodAnnotations;
    }
}
exports.ClassDefinitionContainer = ClassDefinitionContainer;
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
class MapContainer extends ValueContainer {
    constructor(keys, values) {
        super(ValueContainer.mapType);
        this.keys = keys;
        this.values = values;
    }
}
exports.MapContainer = MapContainer;
function isClass(func) {
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}
function isXClass(func, className) {
    let regex = new RegExp("extends.*?" + className);
    if (func.toString().search(regex) != -1) {
        return true;
    }
    //Reached the end of class prototype chain
    else if (Reflect.ownKeys(func).includes("apply")) {
        return false;
    }
    else {
        return isXClass(Reflect.getPrototypeOf(func), className);
    }
}
function isSpiderObjectClass(func) {
    return isXClass(func, "SpiderObject");
}
function isSpiderIsolateClass(func) {
    return isXClass(func, "SpiderIsolate");
}
function isObjectMirrorClass(func) {
    return isXClass(func, "SpiderObjectMirror");
}
function isIsolateMirrorClass(func) {
    return isXClass(func, "SpiderIsolateMirror");
}
function isRepliqClass(func) {
    return isXClass(func, "Repliq");
}
function isSignalClass(func) {
    return isXClass(func, "Signal");
}
function serialisePromise(promise, receiverId, enviroment) {
    var wrapper = enviroment.promisePool.newPromise();
    promise.then((val) => {
        enviroment.commMedium.sendMessage(receiverId, new Message_1.ResolvePromiseMessage(enviroment.thisRef, wrapper.promiseId, serialise(val, receiverId, enviroment), true));
    });
    promise.catch((reason) => {
        enviroment.commMedium.sendMessage(receiverId, new Message_1.RejectPromiseMessage(enviroment.thisRef, wrapper.promiseId, serialise(reason, receiverId, enviroment), true));
    });
    return new PromiseContainer(wrapper.promiseId, enviroment.thisRef.ownerId);
}
function serialiseObject(object, thisRef, objectPool) {
    var oId = objectPool.allocateObject(object);
    let [fieldNames, methodNames] = getObjectNames(object, "toString");
    if (thisRef instanceof FarRef_1.ServerFarReference) {
        return new ServerFarRefContainer(oId, fieldNames, methodNames, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
    }
    else {
        var clientRef = thisRef;
        return new ClientFarRefContainer(oId, fieldNames, methodNames, clientRef.ownerId, clientRef.mainId, clientRef.contactId, clientRef.contactAddress, clientRef.contactPort);
    }
}
function serialiseMap(map, receiverId, environment) {
    let keys = [];
    let values = [];
    map.forEach((value, key) => {
        keys.push(serialise(key, receiverId, environment));
        values.push(serialise(value, receiverId, environment));
    });
    return new MapContainer(JSON.stringify(keys), JSON.stringify(values));
}
function serialise(value, receiverId, environment) {
    if (typeof value == 'object') {
        if (value == null) {
            return new NativeContainer(null);
        }
        else if (value instanceof Buffer) {
            return new NativeContainer(value);
        }
        else if (value instanceof Promise) {
            return serialisePromise(value, receiverId, environment);
        }
        else if (value instanceof Error) {
            return new ErrorContainer(value);
        }
        else if (value instanceof Map) {
            return serialiseMap(value, receiverId, environment);
        }
        else if (value[FarRef_1.FarReference.ServerProxyTypeKey]) {
            var farRef = value[FarRef_1.FarReference.farRefAccessorKey];
            return new ServerFarRefContainer(farRef.objectId, farRef.objectFields, farRef.objectMethods, farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
        }
        else if (value[FarRef_1.FarReference.ClientProxyTypeKey]) {
            let farRef = value[FarRef_1.FarReference.farRefAccessorKey];
            if (environment.thisRef instanceof FarRef_1.ServerFarReference && farRef.contactId == null) {
                //Current actor is a server and is the first to obtain a reference to this client actor. conversation with this client should now be rooted through this actor given that it has a socket reference to it
                return new ClientFarRefContainer(farRef.objectId, farRef.objectFields, farRef.objectMethods, farRef.ownerId, farRef.mainId, environment.thisRef.ownerId, environment.thisRef.ownerAddress, environment.thisRef.ownerPort);
            }
            else {
                return new ClientFarRefContainer(farRef.objectId, farRef.objectFields, farRef.objectMethods, farRef.ownerId, farRef.mainId, farRef.contactId, farRef.contactAddress, farRef.contactPort);
            }
        }
        else if (value instanceof Array) {
            var values = value.map((val) => {
                return serialise(val, receiverId, environment);
            });
            return new ArrayContainer(values);
        }
        else if (value[SpiderIsolateContainer.checkIsolateFuncKey]) {
            let mirror = value[MOP_1.SpiderObjectMirror.mirrorAccessKey];
            let baseOb = mirror.pass(environment.actorMirror);
            let proxyBase = mirror.proxyBase;
            //Remove base reference from mirror to avoid serialising the base object twice
            delete mirror.base;
            delete baseOb[MOP_1.SpiderObjectMirror.mirrorAccessKey];
            delete mirror.proxyBase;
            let [vars, methods, methodAnnots] = deconstructBehaviour(baseOb, 0, [], [], [], receiverId, environment, "__defineGetter__");
            let [mVars, mMethods, mMethodAnnots] = deconstructBehaviour(mirror, 0, [], [], [], receiverId, environment, "__defineGetter__");
            let container = new SpiderIsolateContainer(JSON.stringify(vars), JSON.stringify(methods), JSON.stringify(methodAnnots), JSON.stringify(mVars), JSON.stringify(mMethods), JSON.stringify(mMethodAnnots));
            //Reset base object <=> mirror link
            mirror.base = baseOb;
            mirror.proxyBase = proxyBase;
            baseOb[MOP_1.SpiderObjectMirror.mirrorAccessKey] = mirror;
            return container;
        }
        else if (value[MOP_1.SpiderObject.spiderObjectKey]) {
            let objectMirror = value[MOP_1.SpiderObjectMirror.mirrorAccessKey];
            return serialise(objectMirror.pass(environment.actorMirror), receiverId, environment);
        }
        else {
            return serialiseObject(value, environment.thisRef, environment.objectPool);
        }
    }
    else if (typeof value == 'function') {
        //Value is actualy not a function but the result of a field access on a proxy (which is technically a function, see farRef)
        if (value[FarRef_1.FarReference.proxyWrapperAccessorKey]) {
            return serialisePromise(value, receiverId, environment);
        }
        else if (isClass(value) && isObjectMirrorClass(value)) {
            let chain = utils_1.getClassDefinitionChain(value);
            let scopes = chain.classScopes.map((scope) => {
                if (scope) {
                    return scope.scopeObjects;
                }
                else {
                    return scope;
                }
            });
            let serScopes = scopes.map((scope) => { return serialise(scope, receiverId, environment); });
            let serAnnot = chain.methodAnnotations.map((annots) => { return serialise(annots, receiverId, environment); });
            return new SpiderObjectMirrorDefinitionContainer(chain.serialisedClass, serScopes, serAnnot);
        }
        else if (isClass(value) && isIsolateMirrorClass(value)) {
            let chain = utils_1.getClassDefinitionChain(value);
            let scopes = chain.classScopes.map((scope) => {
                if (scope) {
                    return scope.scopeObjects;
                }
                else {
                    return scope;
                }
            });
            let serScopes = scopes.map((scope) => { return serialise(scope, receiverId, environment); });
            let serAnnot = chain.methodAnnotations.map((annots) => { return serialise(annots, receiverId, environment); });
            return new SpiderIsolateMirrorDefinitionContainer(chain.serialisedClass, serScopes, serAnnot);
        }
        else if (isClass(value) && isSpiderObjectClass(value)) {
            let chain = utils_1.getClassDefinitionChain(value);
            let scopes = chain.classScopes.map((scope) => {
                if (scope) {
                    return scope.scopeObjects;
                }
                else {
                    return scope;
                }
            });
            let serScopes = scopes.map((scope) => { return serialise(scope, receiverId, environment); });
            let serAnnot = chain.methodAnnotations.map((annots) => { return serialise(annots, receiverId, environment); });
            return new SpiderObjectDefinitionContainer(chain.serialisedClass, serScopes, serAnnot);
        }
        else if (isClass(value) && isSpiderIsolateClass(value)) {
            let chain = utils_1.getClassDefinitionChain(value);
            let scopes = chain.classScopes.map((scope) => {
                if (scope) {
                    return scope.scopeObjects;
                }
                else {
                    return scope;
                }
            });
            let serScopes = scopes.map((scope) => {
                return serialise(scope, receiverId, environment);
            });
            let serAnnot = chain.methodAnnotations.map((annots) => { return serialise(annots, receiverId, environment); });
            return new SpiderIsolateDefinitionContainer(chain.serialisedClass, serScopes, serAnnot);
        }
        else if (isClass(value)) {
            let chain = utils_1.getClassDefinitionChain(value, false);
            let scopes = chain.classScopes.map((scope) => {
                if (scope) {
                    return scope.scopeObjects;
                }
                else {
                    return scope;
                }
            });
            let serScopes = scopes.map((scope) => { return serialise(scope, receiverId, environment); });
            let serAnnot = chain.methodAnnotations.map((annots) => { return serialise(annots, receiverId, environment); });
            return new ClassDefinitionContainer(chain.serialisedClass, serScopes, serAnnot);
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
function deserialise(value, environment) {
    function deSerialisePromise(promiseContainer) {
        return environment.promisePool.newForeignPromise(promiseContainer.promiseId, promiseContainer.promiseCreatorId);
    }
    function deSerialiseServerFarRef(farRefContainer) {
        var farRef = new FarRef_1.ServerFarReference(farRefContainer.objectId, farRefContainer.objectFields, farRefContainer.objectMethods, farRefContainer.ownerId, farRefContainer.ownerAddress, farRefContainer.ownerPort, environment);
        if (environment.thisRef instanceof FarRef_1.ServerFarReference) {
            if (!(environment.commMedium.hasConnection(farRef.ownerId))) {
                environment.commMedium.openConnection(farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
            }
        }
        else {
            if (!(environment.commMedium.hasConnection(farRef.ownerId))) {
                environment.commMedium.connectRemote(farRef.ownerAddress, farRef.ownerPort);
            }
        }
        return farRef.proxify();
    }
    function deSerialiseClientFarRef(farRefContainer) {
        var farRef;
        if ((environment.thisRef instanceof FarRef_1.ServerFarReference) && farRefContainer.contactId == null) {
            //This is the first server side actor to come into contact with this client-side far reference and will henceforth be the contact point for all messages sent to this far reference
            farRef = new FarRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.objectFields, farRefContainer.objectMethods, farRefContainer.ownerId, farRefContainer.mainId, environment, environment.thisRef.ownerId, environment.thisRef.ownerAddress, environment.thisRef.ownerPort);
        }
        else {
            farRef = new FarRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.objectFields, farRefContainer.objectMethods, farRefContainer.ownerId, farRefContainer.mainId, environment, farRefContainer.contactId, farRefContainer.contactAddress, farRefContainer.contactPort);
        }
        return farRef.proxify();
    }
    function deSerialiseError(errorContainer) {
        var error = new Error(errorContainer.message);
        error.stack = errorContainer.stack;
        error.name = errorContainer.name;
        return error;
    }
    function deSerialiseArray(arrayContainer) {
        var deserialised = arrayContainer.values.map((valCont) => {
            return deserialise(valCont, environment);
        });
        return deserialised;
    }
    function deSerialiseSpiderObjectDefinition(def) {
        let scopes = def.scopes.map((scope) => {
            return deserialise(scope, environment);
        });
        let methAnnots = def.methodAnnot.map((annots) => {
            return deserialise(annots, environment);
        });
        methAnnots.forEach((annots) => {
            annots.forEach(([annotFunc, annotTag], methName) => {
                annots.set(methName, [constructMethod(annotFunc), annotTag]);
            });
        });
        return utils_1.reconstructClassDefinitionChain(def.definitions, scopes, methAnnots, require("./MOP").SpiderObject, require("./MOP").reCreateObjectClass);
    }
    function deSerialiseSpiderIsolateDefinition(def) {
        let scopes = def.scopes.map((scope) => {
            return deserialise(scope, environment);
        });
        let methAnnots = def.methodAnnot.map((annots) => {
            return deserialise(annots, environment);
        });
        methAnnots.forEach((annots) => {
            annots.forEach(([annotFunc, annotTag], methName) => {
                annots.set(methName, [constructMethod(annotFunc), annotTag]);
            });
        });
        return utils_1.reconstructClassDefinitionChain(def.definitions, scopes, methAnnots, require("./MOP").SpiderIsolate, require("./MOP").reCreateIsolateClass);
    }
    function deSerialiseSpiderIsolate(isolateContainer) {
        var isolate = reconstructBehaviour({}, JSON.parse(isolateContainer.vars), JSON.parse(isolateContainer.methods), JSON.parse(isolateContainer.methAnnots), environment);
        var isolClone = reconstructBehaviour({}, JSON.parse(isolateContainer.vars), JSON.parse(isolateContainer.methods), JSON.parse(isolateContainer.methAnnots), environment);
        var mirror = reconstructBehaviour({}, JSON.parse(isolateContainer.mirrorVars), JSON.parse(isolateContainer.mirrorMethods), JSON.parse(isolateContainer.mirrorMethAnnots), environment);
        isolate.instantiate(mirror, isolClone, MOP_1.wrapPrototypes, MOP_1.makeSpiderObjectProxy, MOP_1.simpleBind);
        //There's an edge case where an actor mirror contains an isolate, when the mirror is deserialised by the ActorProto (i.e. upon creation) the environment is not created yet (ugly but needed)
        if (environment) {
            return mirror.resolve(environment.actorMirror);
        }
        else {
            return mirror.resolve();
        }
    }
    function deSerialiseSpiderObjectMirrorDefintion(def) {
        let scopes = def.scopes.map((scope) => {
            return deserialise(scope, environment);
        });
        let methAnnots = def.methodAnnot.map((annots) => {
            return deserialise(annots, environment);
        });
        methAnnots.forEach((annots) => {
            annots.forEach(([annotFunc, annotTag], methName) => {
                annots.set(methName, [constructMethod(annotFunc), annotTag]);
            });
        });
        return utils_1.reconstructClassDefinitionChain(def.definitions, scopes, methAnnots, require("./MOP").SpiderObjectMirror, require("./MOP").reCreateObjectMirrorClass);
    }
    function deSerialiseSpiderIsolateMirrorDefinition(def) {
        let scopes = def.scopes.map((scope) => {
            return deserialise(scope, environment);
        });
        let methAnnots = def.methodAnnot.map((annots) => {
            return deserialise(annots, environment);
        });
        methAnnots.forEach((annots) => {
            annots.forEach(([annotFunc, annotTag], methName) => {
                annots.set(methName, [constructMethod(annotFunc), annotTag]);
            });
        });
        return utils_1.reconstructClassDefinitionChain(def.definitions, scopes, methAnnots, require("./MOP").SpiderIsolateMirror, require("./MOP").reCreateIsolateMirrorClass);
    }
    function deSerialiseClassDefinition(def) {
        function reCreateClass(classDefinition, scope, superClass) {
            if (superClass != null) {
                let index = classDefinition.indexOf("{");
                let start = classDefinition.substring(0, index);
                let stop = classDefinition.substring(index, classDefinition.length);
                if (scope) {
                    scope.forEach((value, key) => {
                        this[key] = value;
                    });
                }
                var classObj = eval("(" + start + " extends " + superClass + stop + ")");
                return classObj;
            }
            else {
                if (scope) {
                    scope.forEach((value, key) => {
                        this[key] = value;
                    });
                }
                var classObj = eval("(" + classDefinition + ")");
                return classObj;
            }
        }
        let scopes = def.scopes.map((scope) => {
            return deserialise(scope, environment);
        });
        let methAnnots = def.methodAnnot.map((annots) => {
            return deserialise(annots, environment);
        });
        methAnnots.forEach((annots) => {
            annots.forEach(([annotFunc, annotTag], methName) => {
                annots.set(methName, [constructMethod(annotFunc), annotTag]);
            });
        });
        return utils_1.reconstructClassDefinitionChain(def.definitions, scopes, methAnnots, null, reCreateClass);
    }
    function deSerialiseMap(mapContainer) {
        let keys = JSON.parse(mapContainer.keys).map((key) => {
            return deserialise(key, environment);
        });
        let vals = JSON.parse(mapContainer.values).map((val) => {
            return deserialise(val, environment);
        });
        let m = new Map();
        keys.forEach((key, index) => {
            m.set(key, vals[index]);
        });
        return m;
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
        case ValueContainer.spiderObjectDef:
            return deSerialiseSpiderObjectDefinition(value);
        case ValueContainer.objectMirrorDef:
            return deSerialiseSpiderObjectMirrorDefintion(value);
        case ValueContainer.spiderIsolDef:
            return deSerialiseSpiderIsolateDefinition(value);
        case ValueContainer.isolateType:
            return deSerialiseSpiderIsolate(value);
        case ValueContainer.isolMirrorDef:
            return deSerialiseSpiderIsolateMirrorDefinition(value);
        case ValueContainer.classDefType:
            return deSerialiseClassDefinition(value);
        case ValueContainer.mapType:
            return deSerialiseMap(value);
        default:
            console.log(value);
            throw "Unknown value container type :  " + value.type;
    }
}
exports.deserialise = deserialise;
//# sourceMappingURL=serialisation.js.map