"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var serialisation_1 = require("../serialisation");
var RepliqPrimitiveField_1 = require("./RepliqPrimitiveField");
var RepliqObjectField_1 = require("./RepliqObjectField");
var Round_1 = require("./Round");
var utils = require("../utils");
/**
 * Created by flo on 16/03/2017.
 */
var RepliqFields = require("./RepliqPrimitiveField");
function atomic(target, propertyKey, descriptor) {
    var originalMethod = descriptor.value;
    originalMethod[Repliq.isAtomic] = true;
    return {
        value: originalMethod
    };
}
exports.atomic = atomic;
var OnceCommited = (function () {
    function OnceCommited(gspInstance, listenerID) {
        this.gspInstance = gspInstance;
        this.listenerID = listenerID;
    }
    OnceCommited.prototype.onceCommited = function (callback) {
        this.gspInstance.registerRoundListener(callback, this.listenerID);
    };
    return OnceCommited;
}());
var isAtomicContext = false;
var atomicRound = null;
var Repliq = (function () {
    function Repliq() {
    }
    Repliq.prototype.isMetaField = function (fieldName) {
        return fieldName == Repliq.getRepliqFields || fieldName == Repliq.getRepliqID || fieldName == Repliq.getRepliqOwnerID || fieldName == Repliq.getRepliqOriginalMethods || fieldName == Repliq.resetRepliqCommit || fieldName == Repliq.commitRepliq || fieldName == serialisation_1.RepliqContainer.checkRepliqFuncKey || fieldName == Repliq.isClientMaster || fieldName == Repliq.getRepliqOwnerPort || fieldName == Repliq.getRepliqOwnerAddress;
    };
    Repliq.prototype.makeAtomicMethodProxyHandler = function (gspInstance, objectId, ownerId, methodName, fields) {
        var that = this;
        return {
            apply: function (target, thisArg, args) {
                var stateChanging = false;
                if (!gspInstance.inReplay(objectId)) {
                    isAtomicContext = true;
                    atomicRound = gspInstance.newRound(objectId, ownerId, methodName, args);
                }
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                var thisProxy = new Proxy(thisArg, {
                    set: function (target, property, value) {
                        var gspField = fields.get(property);
                        if (!gspInstance.inReplay(objectId)) {
                            stateChanging = true;
                            var update = new RepliqPrimitiveField_1.PrimitiveFieldUpdate(property, gspField.read(), value);
                            Round_1.addRoundUpdate(atomicRound, update, objectId);
                        }
                        gspField.writeField(value);
                        return true;
                    },
                    get: function (target, name) {
                        if (fields.has(name)) {
                            var field = fields.get(name);
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
                var res = target.apply(thisProxy, args);
                if (!gspInstance.inReplay(objectId)) {
                    gspInstance.yield(objectId, ownerId);
                    var ret = new OnceCommited(gspInstance, Round_1.roundListenerId(atomicRound));
                    isAtomicContext = false;
                    atomicRound = null;
                    return ret;
                }
                else {
                    return res;
                }
            }
        };
    };
    Repliq.prototype.makeMethodProxyHandler = function (gspInstance, objectId, ownerId, methodName, fields) {
        var that = this;
        return {
            apply: function (target, thisArg, args) {
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                var round;
                var stateChanging = false;
                var thisProxy = new Proxy(thisArg, {
                    //Set is only called on primitive fields
                    set: function (target, property, value) {
                        var gspField = fields.get(property);
                        if (!gspInstance.inReplay(objectId)) {
                            stateChanging = true;
                            var update = new RepliqPrimitiveField_1.PrimitiveFieldUpdate(property, gspField.read(), value);
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
                            var field = fields.get(name);
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
                var res = target.apply(thisProxy, args);
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
    };
    Repliq.prototype.makeObjectFieldProxy = function (unwrappedField, field, replay, atomic, round, objectId, ownerId, gspInstance) {
        return new Proxy({}, {
            get: function (target, name) {
                var property = unwrappedField[name];
                if (property instanceof Function) {
                    return new Proxy(property, {
                        apply: function (target, thisArg, args) {
                            if (!replay) {
                                var update = new RepliqObjectField_1.ObjectFieldUpdate(field.name, name.toString(), args);
                                Round_1.addRoundUpdate(round, update, objectId);
                                if (!atomic) {
                                    gspInstance.yield(objectId, ownerId);
                                }
                            }
                            var ret = field.methodInvoked(name.toString(), args);
                            return ret;
                        }
                    });
                }
                else {
                    return property;
                }
            }
        });
    };
    Repliq.prototype.makeProxyHandler = function (fields, originalMethods, objectID, ownerId, isClient, ownerAddress, ownerPort) {
        if (ownerAddress === void 0) { ownerAddress = null; }
        if (ownerPort === void 0) { ownerPort = null; }
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
                            return function (updates) {
                                Reflect.ownKeys(updates).forEach(function (key) {
                                    fields.get(key.toString()).resetToCommit();
                                });
                            };
                        }
                        else if (name == Repliq.commitRepliq) {
                            return function (updates) {
                                Reflect.ownKeys(updates).forEach(function (key) {
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
                            var field_1 = fields.get(name);
                            var val = void 0;
                            if (field_1 instanceof RepliqObjectField_1.RepliqObjectField) {
                                val = field_1.read();
                            }
                            else if (field_1[serialisation_1.RepliqContainer.checkRepliqFuncKey]) {
                                return field_1;
                            }
                            else {
                                //Wrap value in an object in order to be able to install onCommit and onTentative listeners
                                val = Object(field_1.read());
                            }
                            Reflect.set(val, "onCommit", function (callback) {
                                field_1.onCommit(callback);
                            });
                            Reflect.set(val, "onTentative", function (callback) {
                                field_1.onTentative(callback);
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
    };
    Repliq.prototype.instantiate = function (gspInstance, thisActorId, isClient, ownerAddress, ownerPort) {
        var _this = this;
        if (ownerAddress === void 0) { ownerAddress = null; }
        if (ownerPort === void 0) { ownerPort = null; }
        this[serialisation_1.RepliqContainer.checkRepliqFuncKey] = true;
        var objectToProxy = {};
        var proxyProto = {};
        Object.setPrototypeOf(objectToProxy, proxyProto);
        var fields = new Map();
        var originalMethods = new Map();
        var repliqId = utils.generateId();
        var fieldKeys = Reflect.ownKeys(this);
        var methodKeys = Reflect.ownKeys(Object.getPrototypeOf(this));
        var handler = this.makeProxyHandler(fields, originalMethods, repliqId, thisActorId, isClient, ownerAddress, ownerPort);
        var meta = RepliqFields.fieldMetaData;
        //"Regular" fields are transformed into standard LWR Fields
        fieldKeys.forEach(function (key) {
            var gspField = Reflect.get(_this, key);
            if (meta.has(key)) {
                var fieldClass = meta.get(key);
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
        methodKeys.forEach(function (key) {
            var property = Reflect.get(Object.getPrototypeOf(_this), key);
            originalMethods.set(key, property);
            var proxyMethod;
            if (property[Repliq.isAtomic]) {
                proxyMethod = new Proxy(property, _this.makeAtomicMethodProxyHandler(gspInstance, repliqId, thisActorId, key.toString(), fields));
            }
            else {
                proxyMethod = new Proxy(property, _this.makeMethodProxyHandler(gspInstance, repliqId, thisActorId, key.toString(), fields));
            }
            Reflect.set(Object.getPrototypeOf(objectToProxy), key, proxyMethod);
        });
        var repliqProxy = new Proxy(objectToProxy, handler);
        gspInstance.newMasterRepliq(repliqProxy, repliqId);
        return repliqProxy;
    };
    Repliq.prototype.reconstruct = function (gspInstance, repliqId, repliqOwnerId, fields, methods, atomicMethods, isClient, ownerAddress, ownerPort, roundNumber) {
        var _this = this;
        if (gspInstance.repliqs.has(repliqId)) {
            return gspInstance.repliqs.get(repliqId);
        }
        else {
            gspInstance.roundNumbers.set(repliqId, roundNumber);
            var objectToProxy_1 = {};
            var protoToProxy_1 = {};
            Object.setPrototypeOf(objectToProxy_1, protoToProxy_1);
            fields.forEach(function (repliqField, fieldName) {
                Reflect.set(objectToProxy_1, fieldName, repliqField);
            });
            methods.forEach(function (method, methodName) {
                var proxyMethod = new Proxy(method, _this.makeMethodProxyHandler(gspInstance, repliqId, repliqOwnerId, methodName, fields));
                Reflect.set(protoToProxy_1, methodName, proxyMethod);
            });
            atomicMethods.forEach(function (method, methodName) {
                method[Repliq.isAtomic] = true;
                var proxyMethod = new Proxy(method, _this.makeAtomicMethodProxyHandler(gspInstance, repliqId, repliqOwnerId, methodName, fields));
                Reflect.set(protoToProxy_1, methodName, proxyMethod);
                //Store the atomic method in regular methods (in case this repliq is serialised again
                methods.set(methodName, method);
            });
            var handler = this.makeProxyHandler(fields, methods, repliqId, repliqOwnerId, isClient, ownerAddress, ownerPort);
            var repliqProxy = new Proxy(objectToProxy_1, handler);
            gspInstance.registerReplica(repliqId, repliqProxy);
            return repliqProxy;
        }
    };
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
    return Repliq;
}());
exports.Repliq = Repliq;
