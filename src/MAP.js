Object.defineProperty(exports, "__esModule", { value: true });
const FarRef_1 = require("./FarRef");
const Message_1 = require("./Message");
class SpiderActorMirror {
    getInitChain(behaviourObject, result) {
        var properties = Reflect.ownKeys(behaviourObject);
        //Have reached base level object, end of prototype chain (ugly but works)
        if (properties.indexOf("init") != -1) {
            result.unshift(Reflect.get(behaviourObject, "init"));
        }
        if (properties.indexOf("valueOf") != -1) {
            return result;
        }
        else {
            return this.getInitChain(behaviourObject.__proto__, result);
        }
    }
    sendRoute(toId, contactId, contactAddress, contactPort, msg) {
        if (!this.base.commMedium.hasConnection(toId)) {
            this.base.commMedium.openConnection(toId, contactAddress, contactPort);
        }
        //TODO quick fix, need to refactor to make sure that message contains the correct contact info (needed to produce return values)
        msg.contactId = toId;
        msg.contactAddress = contactAddress;
        msg.contactPort = contactPort;
        this.base.commMedium.sendMessage(toId, new Message_1.RouteMessage(this.base.thisRef, toId, msg));
    }
    send(targetRef, toId, msg, contactId, contactAddress, contactPort, mainId) {
        let holderRef = this.base.thisRef;
        if (holderRef instanceof FarRef_1.ServerFarReference) {
            if (targetRef instanceof FarRef_1.ServerFarReference) {
                this.base.commMedium.sendMessage(toId, msg);
            }
            else if (holderRef.ownerId == contactId) {
                this.base.commMedium.sendMessage(toId, msg);
            }
            else {
                this.sendRoute(toId, contactId, contactAddress, contactPort, msg);
            }
        }
        else {
            if (targetRef instanceof FarRef_1.ServerFarReference) {
                if (!this.base.commMedium.hasConnection(toId)) {
                    this.base.commMedium.openConnection(toId, targetRef.ownerAddress, targetRef.ownerPort);
                }
                this.base.commMedium.sendMessage(toId, msg);
            }
            else if (holderRef.mainId == mainId) {
                this.base.commMedium.sendMessage(toId, msg);
            }
            else {
                this.sendRoute(toId, contactId, contactAddress, contactPort, msg);
            }
        }
    }
    bindBase(base, serialise) {
        this.base = base;
        this.serialise = serialise;
    }
    //Only non-app actors have a parent reference
    initialise(actSTDLib, appActor, parentRef = null) {
        let behaviourObject = this.base.objectPool.getObject(0);
        if (!appActor) {
            behaviourObject["parent"] = parentRef.proxify();
        }
        behaviourObject["libs"] = actSTDLib;
        if (!appActor) {
            var initChain = this.getInitChain(behaviourObject, []);
            initChain.forEach((initFunc) => {
                initFunc.apply(behaviourObject, []);
            });
        }
    }
    receiveInvocation(sender, targetObject, methodName, args, performInvocation = () => { return undefined; }, sendReturn = () => { return undefined; }) {
        let retVal = performInvocation();
        sendReturn(retVal);
    }
    receiveAccess(sender, targetObject, fieldName, performAccess = () => undefined) {
        performAccess();
    }
    sendInvocation(target, methodName, args, contactId = this.base.thisRef.ownerId, contactAddress = null, contactPort = null, mainId = null) {
        let targetRef = target[FarRef_1.FarReference.farRefAccessorKey];
        var promiseAlloc = this.base.promisePool.newPromise();
        let serialisedArgs = args.map((arg) => {
            return this.serialise(arg, targetRef.ownerId, this.base);
        });
        this.send(targetRef, targetRef.ownerId, new Message_1.MethodInvocationMessage(this.base.thisRef, targetRef.objectId, methodName, serialisedArgs, promiseAlloc.promiseId), contactId, contactAddress, contactPort, mainId);
        return promiseAlloc.promise;
    }
    sendAccess(target, fieldName, contactId = this.base.thisRef.ownerId, contactAddress = null, contactPort = null, mainId = null) {
        let targetRef = target[FarRef_1.FarReference.farRefAccessorKey];
        var promiseAlloc = this.base.promisePool.newPromise();
        this.send(targetRef, targetRef.ownerId, new Message_1.FieldAccessMessage(this.base.thisRef, targetRef.objectId, fieldName, promiseAlloc.promiseId), contactId, contactAddress, contactPort, mainId);
        return promiseAlloc.promise;
    }
}
exports.SpiderActorMirror = SpiderActorMirror;
//# sourceMappingURL=MAP.js.map