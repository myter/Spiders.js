Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 05/12/2016.
 */
function isBrowser() {
    var isNode = false;
    if (typeof process === 'object') {
        if (typeof process.versions === 'object') {
            if (typeof process.versions.node !== 'undefined') {
                isNode = true;
            }
        }
    }
    return !(isNode);
}
exports.isBrowser = isBrowser;
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.generateId = generateId;
//Clone function comes from stack overflow thread:
//http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function cloneDR(o) {
    const gdcc = "__getDeepCircularCopy__";
    if (o !== Object(o)) {
        return o; // primitive value
    }
    var set = gdcc in o, cache = o[gdcc], result;
    if (set && typeof cache == "function") {
        return cache();
    }
    // else
    o[gdcc] = function () { return result; }; // overwrite
    if (o instanceof Array) {
        result = [];
        for (var i = 0; i < o.length; i++) {
            result[i] = cloneDR(o[i]);
        }
    }
    else if (o instanceof Function) {
        result = o;
    }
    else {
        result = {};
        Reflect.ownKeys(o).forEach((k) => {
            if (k != gdcc) {
                result[k] = cloneDR(o[k]);
            }
            else if (set) {
                result[k] = cloneDR(cache);
            }
        });
    }
    for (var prop in o)
        if (prop != gdcc)
            result[prop] = cloneDR(o[prop]);
        else if (set)
            result[prop] = cloneDR(cache);
    if (set) {
        o[gdcc] = cache; // reset
    }
    else {
        delete o[gdcc]; // unset again
    }
    return result;
}
exports.cloneDR = cloneDR;
//REALLY ugly way of checking whether we have reached the end of the prototype chain while cloning
function isLastPrototype(object) {
    return object == null;
}
function clone(object) {
    let base = cloneDR(object);
    function walkProto(proto, last) {
        if (!(isLastPrototype(proto))) {
            let protoClone = cloneDR(proto);
            Reflect.setPrototypeOf(last, protoClone);
            walkProto(Reflect.getPrototypeOf(proto), protoClone);
        }
    }
    walkProto(Reflect.getPrototypeOf(object), base);
    return base;
}
exports.clone = clone;
function getSerialiableClassDefinition(classDefinition) {
    return classDefinition.toString().replace(/(\extends)(.*?)(?=\{)/, '');
}
exports.getSerialiableClassDefinition = getSerialiableClassDefinition;
function getClassDefinitionChain(classDefinition, ignoreLast = true) {
    let loop = (currentClass, accum) => {
        if (Reflect.ownKeys(Reflect.getPrototypeOf(currentClass)).includes("apply") && ignoreLast) {
            return accum;
        }
        else if (Reflect.ownKeys(currentClass).includes("apply")) {
            return accum;
        }
        else {
            accum.push(getSerialiableClassDefinition(currentClass));
            return loop(Reflect.getPrototypeOf(currentClass), accum);
        }
    };
    return loop(classDefinition, []);
}
exports.getClassDefinitionChain = getClassDefinitionChain;
function reconstructClassDefinitionChain(classes, topClass, recreate) {
    let loop = (currentIndex, parentClass) => {
        if (currentIndex == 0) {
            return recreate(classes[currentIndex], parentClass);
        }
        else {
            let newParent = recreate(classes[currentIndex], parentClass);
            return loop(--currentIndex, newParent);
        }
    };
    return loop(classes.length - 1, topClass);
}
exports.reconstructClassDefinitionChain = reconstructClassDefinitionChain;
//# sourceMappingURL=utils.js.map