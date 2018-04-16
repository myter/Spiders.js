Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const serialisation_1 = require("./serialisation");
class SpiderObjectMirror {
    bindBase(base) {
        this.base = base;
    }
    bindProxy(proxy) {
        this.proxyBase = proxy;
    }
    invoke(methodName, args) {
        return this.base[methodName](...args);
    }
    access(fieldName) {
        return this.base[fieldName];
    }
    write(fieldName, value) {
        if (typeof value == 'function') {
            Reflect.getPrototypeOf(this.base)[fieldName] = value;
        }
        else {
            this.base[fieldName] = value;
        }
        return true;
    }
    pass(hostActorMirror) {
        return makeSpiderObjectProxy(this.base, this, false);
    }
    resolve(hostActorMirror) {
        //Regular object is sent by far reference, therefore no need to provide a resolve implementation given that this mirror will not be pased along
        return this.proxyBase;
    }
}
SpiderObjectMirror.mirrorAccessKey = "_SPIDER_OBJECT_MIRROR_";
exports.SpiderObjectMirror = SpiderObjectMirror;
class SpiderIsolateMirror {
    constructor() {
        this[serialisation_1.SpiderIsolateContainer.checkIsolateFuncKey] = true;
    }
    bindBase(base) {
        this.base = base;
    }
    bindProxy(proxy) {
        this.proxyBase = proxy;
    }
    invoke(methodName, args) {
        return this.base[methodName](...args);
    }
    access(fieldName) {
        return this.base[fieldName];
    }
    write(fieldName, value) {
        if (typeof value == 'function') {
            Reflect.getPrototypeOf(this.base)[fieldName] = value;
        }
        else {
            this.base[fieldName] = value;
        }
        return true;
    }
    pass(hostActorMirror) {
        return this.base;
    }
    resolve(hostActorMirror) {
        //Regular object is sent by far reference, therefore no need to provide a resolve implementation given that this mirror will not be pased along
        return this.proxyBase;
    }
}
exports.SpiderIsolateMirror = SpiderIsolateMirror;
function isInternal(property) {
    return property == "_FAR_REF_" || property == "_PROXY_WRAPPER_" || property == "SPIDER_SERVER_TYPE" || property == "SPIDER_CLIENT_TYPE" || property == "_SERVER_" || property == "_CLIENT_" || property == "_INSTANCEOF_Signal_" || property == "_INSTANCEOF_ISOLATE_" || property == "_INSTANCEOF_ARRAY_ISOLATE_" || property == "_INSTANCEOF_REPLIQ_" || property == "_INSTANCEOF_Signal_" || property == "setEnv" || property == "_SPIDER_OBJECT_" || property == "hasOwnProperty";
}
//Taken from the following thread:
//https://stackoverflow.com/questions/34255580/bind-that-does-not-return-native-code-in-javascript
//Binding using Javascript's bind messes up the function's toString() method (returns [native code])
//Might need the function's source for serialisation etc
function simpleBind(fun, ctx) {
    var newFun = function () {
        return fun.apply(ctx, arguments);
    };
    newFun.toString = function () {
        return fun.toString();
    };
    newFun.unBind = function () {
        return fun;
    };
    return newFun;
}
exports.simpleBind = simpleBind;
function makeSpiderObjectProxy(baseObject, mirror, considerAsObject = true) {
    return new Proxy(baseObject, {
        get: function (target, property) {
            if (property.toString() == SpiderObjectMirror.mirrorAccessKey) {
                return mirror;
            }
            else if (property.toString() == SpiderObject.spiderObjectKey) {
                return considerAsObject;
            }
            else if (isInternal(property.toString())) {
                let prop = baseObject[property];
                if (typeof prop === 'function') {
                    return (...args) => {
                        return mirror.base[property](...args);
                    };
                }
                else {
                    return mirror.base[property];
                }
            }
            else {
                let prop = baseObject[property];
                if (typeof prop === 'function') {
                    return (...args) => {
                        return mirror.invoke(property, args);
                    };
                }
                else {
                    return mirror.access(property);
                }
            }
        },
        set: function (target, property, value, receiver) {
            if (!isInternal(property.toString())) {
                return mirror.write(property.toString(), value);
            }
            else {
                target[property] = value;
                return true;
            }
        }
    });
}
exports.makeSpiderObjectProxy = makeSpiderObjectProxy;
function wrapPrototypes(currentLevel, mirror) {
    if (!currentLevel.hasOwnProperty("mirror")) {
        let proto = Reflect.getPrototypeOf(currentLevel);
        Reflect.setPrototypeOf(currentLevel, makeSpiderObjectProxy(proto, mirror));
        wrapPrototypes(proto, mirror);
    }
}
exports.wrapPrototypes = wrapPrototypes;
class SpiderObject {
    constructor(objectMirror = new SpiderObjectMirror()) {
        //Need to explicitly clone the base object, given that we are going to mess with its prototype chain etc at the end of the constructor
        let thisClone = utils_1.clone(this);
        objectMirror.bindBase(thisClone);
        this.mirror = objectMirror;
        this[SpiderObjectMirror.mirrorAccessKey] = this.mirror;
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this, this.mirror);
        let proxied = makeSpiderObjectProxy(thisClone, this.mirror);
        for (var i in thisClone) {
            if (typeof thisClone[i] == 'function' && i != "constructor") {
                thisClone[i] = simpleBind(thisClone[i], proxied);
                //thisClone[i] = thisClone[i].bind(proxied)
            }
        }
        objectMirror.bindProxy(proxied);
        return proxied;
    }
}
SpiderObject.spiderObjectKey = "_SPIDER_OBJECT_";
exports.SpiderObject = SpiderObject;
class SpiderIsolate {
    constructor(objectMirror = new SpiderIsolateMirror()) {
        this[serialisation_1.SpiderIsolateContainer.checkIsolateFuncKey] = true;
        //Need to explicitly clone the base object, given that we are going to mess with its prototype chain etc at the end of the constructor
        let lex = this.constructor[utils_1.LexScope._LEX_SCOPE_KEY_];
        let thisClone = utils_1.clone(this);
        //Cloning appears to break the lexical scope object (maps are wrongly cloned), this is an easy temp fix
        this.constructor[utils_1.LexScope._LEX_SCOPE_KEY_] = lex;
        //this.constructor = construct
        objectMirror.bindBase(thisClone);
        this.mirror = objectMirror;
        thisClone[SpiderObjectMirror.mirrorAccessKey] = objectMirror;
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this, this.mirror);
        let proxied = makeSpiderObjectProxy(thisClone, this.mirror);
        for (var i in thisClone) {
            if (typeof thisClone[i] == 'function') {
                let original = thisClone[i];
                let toCopy = [];
                Reflect.ownKeys(original).forEach((key) => {
                    if (key != "length" && key != "name" && key != "arguments" && key != "caller" && key != "prototype") {
                        toCopy.push([key, original[key]]);
                    }
                });
                thisClone[i] = simpleBind(thisClone[i], proxied);
                //thisClone[i] = thisClone[i].bind(proxied);
                toCopy.forEach(([key, val]) => {
                    thisClone[i][key] = val;
                });
            }
        }
        objectMirror.bindProxy(proxied);
        return proxied;
    }
    //Called by serialise on an already constructed isolate which has just been passed
    instantiate(objectMirror, isolClone, wrapPrototypes, makeSpiderObjectProxy, simpleBind) {
        objectMirror.bindBase(isolClone);
        this.mirror = objectMirror;
        isolClone["_SPIDER_OBJECT_MIRROR_"] = objectMirror;
        //Make sure the object's prototypes are wrapped as well
        wrapPrototypes(this, this.mirror);
        let proxied = makeSpiderObjectProxy(isolClone, this.mirror);
        for (var i in isolClone) {
            if (typeof isolClone[i] == 'function') {
                let original = isolClone[i];
                let toCopy = [];
                Reflect.ownKeys(original).forEach((key) => {
                    if (key != "length" && key != "name" && key != "arguments" && key != "caller" && key != "prototype") {
                        toCopy.push([key, original[key]]);
                    }
                });
                isolClone[i] = simpleBind(isolClone[i], proxied);
                //isolClone[i] = isolClone[i].bind(proxied);
                toCopy.forEach(([key, val]) => {
                    isolClone[i][key] = val;
                });
            }
        }
        objectMirror.bindProxy(proxied);
        return proxied;
    }
}
exports.SpiderIsolate = SpiderIsolate;
//ReCreate functions ensure that deserialised class definitions are evalled in the same scope as the original definitions
function reCreateIsolateClass(classDefinition, scope, superClass = undefined) {
    if (superClass) {
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
exports.reCreateIsolateClass = reCreateIsolateClass;
exports.reCreateObjectClass = reCreateIsolateClass;
exports.reCreateObjectMirrorClass = reCreateIsolateClass;
exports.reCreateIsolateMirrorClass = reCreateIsolateClass;
//# sourceMappingURL=MOP.js.map