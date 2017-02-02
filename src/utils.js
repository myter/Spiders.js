const spiders_1 = require("./spiders");
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
function installSTDLib(thisRef, parentRef, behaviourObject, messageHandler, commMedium, promisePool) {
    behaviourObject["parent"] = parentRef.proxyify();
    behaviourObject["remote"] = (address, port) => {
        return commMedium.connectRemote(thisRef, address, port, messageHandler, promisePool);
    };
    behaviourObject["Isolate"] = spiders_1.Isolate;
    behaviourObject["ArrayIsolate"] = spiders_1.ArrayIsolate;
    if (Reflect.has(behaviourObject, "init")) {
        behaviourObject["init"]();
    }
}
exports.installSTDLib = installSTDLib;
//# sourceMappingURL=utils.js.map