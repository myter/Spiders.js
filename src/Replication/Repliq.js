Object.defineProperty(exports, "__esModule", { value: true });
const serialisation_1 = require("../serialisation");
const RepliqPrimitiveField_1 = require("./RepliqPrimitiveField");
const RepliqObjectField_1 = require("./RepliqObjectField");
const Round_1 = require("./Round");
var utils = require("../utils");
/**
 * Created by flo on 16/03/2017.
 */
var RepliqFields = require("./RepliqPrimitiveField");
function atomic(target, propertyKey, descriptor) {
    let originalMethod = descriptor.value;
    originalMethod[Repliq.isAtomic] = true;
    return {
        value: originalMethod
    };
}
exports.atomic = atomic;
class OnceCommited {
    constructor(gspInstance, listenerID) {
        this.gspInstance = gspInstance;
        this.listenerID = listenerID;
    }
    onceCommited(callback) {
        this.gspInstance.registerRoundListener(callback, this.listenerID);
    }
}
let isAtomicContext = false;
let atomicRound = null;
class Repliq {
    isMetaField(fieldName) {
        return fieldName == Repliq.getRepliqFields || fieldName == Repliq.getRepliqID || fieldName == Repliq.getRepliqOwnerID || fieldName == Repliq.getRepliqOriginalMethods || fieldName == Repliq.resetRepliqCommit || fieldName == Repliq.commitRepliq || fieldName == serialisation_1.RepliqContainer.checkRepliqFuncKey || fieldName == Repliq.isClientMaster || fieldName == Repliq.getRepliqOwnerPort || fieldName == Repliq.getRepliqOwnerAddress;
    }
    makeAtomicMethodProxyHandler(gspInstance, objectId, ownerId, methodName, fields) {
        var that = this;
        return {
            apply: function (target, thisArg, args) {
                let stateChanging = false;
                if (!gspInstance.inReplay(objectId)) {
                    isAtomicContext = true;
                    atomicRound = gspInstance.newRound(objectId, ownerId, methodName, args);
                }
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                let thisProxy = new Proxy(thisArg, {
                    set: function (target, property, value) {
                        let gspField = fields.get(property);
                        if (!gspInstance.inReplay(objectId)) {
                            stateChanging = true;
                            let update = new RepliqPrimitiveField_1.PrimitiveFieldUpdate(property, gspField.read(), value);
                            Round_1.addRoundUpdate(atomicRound, update, objectId);
                        }
                        gspField.writeField(value);
                        return true;
                    },
                    get: function (target, name) {
                        if (fields.has(name)) {
                            let field = fields.get(name);
                            if (field instanceof RepliqObjectField_1.RepliqObjectField) {
                                if (!gspInstance.inReplay(objectId)) {
                                    atomicRound = gspInstance.newRound(objectId, ownerId, methodName, args);
                                }
                                return that.makeObjectFieldProxy(target[name], field, gspInstance.inReplay(objectId), true, atomicRound, objectId, ownerId, gspInstance);
                            }
                            else {
                                return field;
                            }
                        }
                        else {
                            return target[name];
                        }
                    }
                });
                let res = target.apply(thisProxy, args);
                if (!gspInstance.inReplay(objectId)) {
                    gspInstance.yield(objectId, ownerId);
                    let ret = new OnceCommited(gspInstance, Round_1.roundListenerId(atomicRound));
                    isAtomicContext = false;
                    atomicRound = null;
                    return ret;
                }
                else {
                    return res;
                }
            }
        };
    }
    makeMethodProxyHandler(gspInstance, objectId, ownerId, methodName, fields) {
        var that = this;
        return {
            apply: function (target, thisArg, args) {
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                let round;
                let stateChanging = false;
                let thisProxy = new Proxy(thisArg, {
                    //Set is only called on primitive fields
                    set: function (target, property, value) {
                        let gspField = fields.get(property);
                        if (!gspInstance.inReplay(objectId)) {
                            stateChanging = true;
                            let update = new RepliqPrimitiveField_1.PrimitiveFieldUpdate(property, gspField.read(), value);
                            if (!isAtomicContext) {
                                round = gspInstance.newRound(objectId, ownerId, methodName, args);
                                Round_1.addRoundUpdate(round, update, objectId);
                                gspInstance.yield(objectId, ownerId);
                            }
                            else {
                                Round_1.addRoundUpdate(atomicRound, update, objectId);
                            }
                        }
                        gspField.writeField(value);
                        return true;
                    },
                    get: function (target, name) {
                        if (fields.has(name)) {
                            let field = fields.get(name);
                            if (field instanceof RepliqObjectField_1.RepliqObjectField) {
                                if (!gspInstance.inReplay(objectId)) {
                                    round = gspInstance.newRound(objectId, ownerId, methodName, args);
                                    stateChanging = true;
                                }
                                return that.makeObjectFieldProxy(target[name], field, gspInstance.inReplay(objectId), false, round, objectId, ownerId, gspInstance);
                            }
                            else {
                                return field;
                            }
                        }
                        else {
                            return target[name];
                        }
                    }
                });
                let res = target.apply(thisProxy, args);
                //The invoked method might not update the Repliq's state
                if (!gspInstance.inReplay(objectId) && stateChanging) {
                    if (isAtomicContext) {
                        return new OnceCommited(gspInstance, Round_1.roundListenerId(atomicRound));
                    }
                    else {
                        return new OnceCommited(gspInstance, Round_1.roundListenerId(round));
                    }
                }
                else {
                    return res;
                }
            }
        };
    }
    makeObjectFieldProxy(unwrappedField, field, replay, atomic, round, objectId, ownerId, gspInstance) {
        return new Proxy({}, {
            get: function (target, name) {
                let property = unwrappedField[name];
                if (property instanceof Function) {
                    return new Proxy(property, {
                        apply: function (target, thisArg, args) {
                            if (!replay) {
                                let update = new RepliqObjectField_1.ObjectFieldUpdate(field.name, name.toString(), args);
                                Round_1.addRoundUpdate(round, update, objectId);
                                if (!atomic) {
                                    gspInstance.yield(objectId, ownerId);
                                }
                            }
                            let ret = field.methodInvoked(name.toString(), args);
                            return ret;
                        }
                    });
                }
                else {
                    return property;
                }
            }
        });
    }
    makeProxyHandler(fields, originalMethods, objectID, ownerId, isClient, ownerAddress = null, ownerPort = null) {
        var that = this;
        return {
            set: function (target, property, value, receiver) {
                console.log(property);
                throw new Error("Assignment of Repliq fields not allowed");
            },
            get: function (target, name) {
                if (Reflect.has(target, name) || that.isMetaField(name)) {
                    var property = Reflect.get(target, name);
                    if (typeof property != 'function') {
                        if (name == Repliq.getRepliqID) {
                            return objectID;
                        }
                        else if (name == Repliq.getRepliqOwnerID) {
                            return ownerId;
                        }
                        else if (name == Repliq.getRepliqFields) {
                            return fields;
                        }
                        else if (name == Repliq.getRepliqOriginalMethods) {
                            return originalMethods;
                        }
                        else if (name == Repliq.resetRepliqCommit) {
                            return (updates) => {
                                Reflect.ownKeys(updates).forEach((key) => {
                                    fields.get(key.toString()).resetToCommit();
                                });
                            };
                        }
                        else if (name == Repliq.commitRepliq) {
                            return (updates) => {
                                Reflect.ownKeys(updates).forEach((key) => {
                                    fields.get(key.toString()).commit();
                                });
                            };
                        }
                        else if (name == serialisation_1.RepliqContainer.checkRepliqFuncKey) {
                            return true;
                        }
                        else if (name == Repliq.isClientMaster) {
                            return isClient;
                        }
                        else if (name == Repliq.getRepliqOwnerAddress) {
                            return ownerAddress;
                        }
                        else if (name == Repliq.getRepliqOwnerPort) {
                            return ownerPort;
                        }
                        else {
                            let field = fields.get(name);
                            let val;
                            if (field instanceof RepliqObjectField_1.RepliqObjectField) {
                                val = field.read();
                            }
                            else if (field[serialisation_1.RepliqContainer.checkRepliqFuncKey]) {
                                return field;
                            }
                            else {
                                //Wrap value in an object in order to be able to install onCommit and onTentative listeners
                                val = Object(field.read());
                            }
                            Reflect.set(val, "onCommit", (callback) => {
                                field.onCommit(callback);
                            });
                            Reflect.set(val, "onTentative", (callback) => {
                                field.onTentative(callback);
                            });
                            //TODO for security reasons we could return a proxy in case of a ObjectField which disallows the invocation of methods (i.e. because methods on object fields can only be called from withint a Repliq)
                            return val;
                        }
                    }
                    else {
                        return property;
                    }
                }
                else {
                    return undefined;
                }
            }
        };
    }
    instantiate(gspInstance, thisActorId, isClient, ownerAddress = null, ownerPort = null) {
        this[serialisation_1.RepliqContainer.checkRepliqFuncKey] = true;
        let objectToProxy = {};
        let proxyProto = {};
        Object.setPrototypeOf(objectToProxy, proxyProto);
        let fields = new Map();
        let originalMethods = new Map();
        let repliqId = utils.generateId();
        let fieldKeys = Reflect.ownKeys(this);
        let methodKeys = Reflect.ownKeys(Object.getPrototypeOf(this));
        let handler = this.makeProxyHandler(fields, originalMethods, repliqId, thisActorId, isClient, ownerAddress, ownerPort);
        let meta = RepliqFields.fieldMetaData;
        //"Regular" fields are transformed into standard LWR Fields
        fieldKeys.forEach((key) => {
            var gspField = Reflect.get(this, key);
            if (meta.has(key)) {
                let fieldClass = meta.get(key);
                gspField = new fieldClass(key, gspField);
            }
            if (!(gspField instanceof RepliqPrimitiveField_1.RepliqPrimitiveField) && !(gspField instanceof RepliqObjectField_1.RepliqObjectField) && !(gspField[serialisation_1.RepliqContainer.checkRepliqFuncKey])) {
                if (gspField instanceof Object) {
                    gspField = new RepliqObjectField_1.RepliqObjectField(key.toString(), gspField);
                }
                else {
                    gspField = new RepliqPrimitiveField_1.RepliqPrimitiveField(key.toString(), gspField);
                }
            }
            fields.set(key.toString(), gspField);
            Reflect.set(objectToProxy, key, gspField);
        });
        //Replace all methods with proxies which intercept apply to log method application
        methodKeys.shift(); // First entry is always constructor method
        methodKeys.forEach((key) => {
            var property = Reflect.get(Object.getPrototypeOf(this), key);
            originalMethods.set(key, property);
            let proxyMethod;
            if (property[Repliq.isAtomic]) {
                proxyMethod = new Proxy(property, this.makeAtomicMethodProxyHandler(gspInstance, repliqId, thisActorId, key.toString(), fields));
            }
            else {
                proxyMethod = new Proxy(property, this.makeMethodProxyHandler(gspInstance, repliqId, thisActorId, key.toString(), fields));
            }
            Reflect.set(Object.getPrototypeOf(objectToProxy), key, proxyMethod);
        });
        let repliqProxy = new Proxy(objectToProxy, handler);
        gspInstance.newMasterRepliq(repliqProxy, repliqId);
        return repliqProxy;
    }
    reconstruct(gspInstance, repliqId, repliqOwnerId, fields, methods, atomicMethods, isClient, ownerAddress, ownerPort, roundNumber) {
        if (gspInstance.repliqs.has(repliqId)) {
            return gspInstance.repliqs.get(repliqId);
        }
        else {
            gspInstance.roundNumbers.set(repliqId, roundNumber);
            let objectToProxy = {};
            let protoToProxy = {};
            Object.setPrototypeOf(objectToProxy, protoToProxy);
            fields.forEach((repliqField, fieldName) => {
                Reflect.set(objectToProxy, fieldName, repliqField);
            });
            methods.forEach((method, methodName) => {
                let proxyMethod = new Proxy(method, this.makeMethodProxyHandler(gspInstance, repliqId, repliqOwnerId, methodName, fields));
                Reflect.set(protoToProxy, methodName, proxyMethod);
            });
            atomicMethods.forEach((method, methodName) => {
                method[Repliq.isAtomic] = true;
                let proxyMethod = new Proxy(method, this.makeAtomicMethodProxyHandler(gspInstance, repliqId, repliqOwnerId, methodName, fields));
                Reflect.set(protoToProxy, methodName, proxyMethod);
                //Store the atomic method in regular methods (in case this repliq is serialised again
                methods.set(methodName, method);
            });
            let handler = this.makeProxyHandler(fields, methods, repliqId, repliqOwnerId, isClient, ownerAddress, ownerPort);
            let repliqProxy = new Proxy(objectToProxy, handler);
            gspInstance.registerReplica(repliqId, repliqProxy);
            return repliqProxy;
        }
    }
}
Repliq.getRepliqFields = "_GET_REPLIQ_FIELDS_";
Repliq.getRepliqID = "_GET_REPLIQ_ID_";
Repliq.getRepliqOwnerID = "_GET_REPLIQ_OWNER_ID_";
Repliq.getRepliqOriginalMethods = "_GET_REPLIQ_ORIGI_METHODS_";
Repliq.resetRepliqCommit = "_RESET_REPLIQ_";
Repliq.commitRepliq = "_COMMIT_";
Repliq.isAtomic = "_IS_ATOMIC_";
Repliq.isClientMaster = "_IS_CLIENT_MASTER_";
Repliq.getRepliqOwnerPort = "_GET_REPLIQ_OWNER_PORT_";
Repliq.getRepliqOwnerAddress = "_GET_REPLIQ_OWNER_ADDRESS_";
exports.Repliq = Repliq;
//# sourceMappingURL=Repliq.js.map