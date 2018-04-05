Object.defineProperty(exports, "__esModule", { value: true });
const FarRef_1 = require("./FarRef");
const signal_1 = require("./Reactivivity/signal");
const Message_1 = require("./Message");
const MOP_1 = require("./MOP");
class SpiderActorMirror {
    constructor() {
        this.CONSTRAINT_OK = "ok";
    }
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
    checkRegularLiftConstraints(...liftArgs) {
        let someGarbage = false;
        liftArgs.forEach((a) => {
            if (a instanceof signal_1.SignalValue) {
                someGarbage = someGarbage || a.holder.isGarbage;
            }
        });
        if (someGarbage) {
            return "Cannot use regular lift (i.e. lift/liftStrong/liftStrong) on signal part of garbage dependency graph";
        }
        else {
            return this.CONSTRAINT_OK;
        }
    }
    checkFailureLiftConstraints(...liftArgs) {
        let someStrong = false;
        liftArgs.forEach((a) => {
            if (a instanceof signal_1.SignalValue) {
                someStrong = someStrong || a.holder.strong;
            }
        });
        if (someStrong) {
            return "Calling failure lift on strong signal (which will never propagate garbage collection event)";
        }
        else {
            return this.CONSTRAINT_OK;
        }
    }
    checkStrongLiftConstraints(...liftArgs) {
        let allStrong = true;
        liftArgs.forEach((a) => {
            if (a instanceof signal_1.SignalValue) {
                allStrong = allStrong && a.holder.strong;
            }
        });
        if (allStrong) {
            return this.CONSTRAINT_OK;
        }
        else {
            return "Trying to create strong lifted signal with a weak dependency";
        }
    }
    bindBase(base, serialise) {
        this.base = base;
        this.serialise = serialise;
    }
    //Only non-app actors have a parent reference
    initialise(appActor, parentRef = null) {
        let commMedium = this.base.commMedium;
        let thisRef = this.base.thisRef;
        let promisePool = this.base.promisePool;
        let signalPool = this.base.signalPool;
        let gspInstance = this.base.gspInstance;
        let behaviourObject = this.base.objectPool.getObject(0);
        if (!appActor) {
            behaviourObject["parent"] = parentRef.proxyify();
        }
        behaviourObject["remote"] = (address, port) => {
            return commMedium.connectRemote(thisRef, address, port, promisePool);
        };
        behaviourObject["reflectOnActor"] = () => {
            return this;
        };
        behaviourObject["reflectOnObject"] = (object) => {
            return object[MOP_1.SpiderObjectMirror.mirrorAccessKey];
        };
        ///////////////////
        //Pub/Sub       //
        //////////////////
        /*behaviourObject["PSClient"]         = ((serverAddress = "127.0.0.1",serverPort = 8000) =>{
            let psClient                    = new PSClient(serverAddress,serverPort,behaviourObject)
            behaviourObject["publish"]      = psClient.publish.bind(psClient)
            behaviourObject["subscribe"]    = psClient.subscribe.bind(psClient)
            behaviourObject["newPublished"] = psClient.newPublished.bind(psClient)
        })

        behaviourObject["newPSTag"]         = ((name : string)=>{
            let PubSubTag = require('./PubSub/SubTag').PubSubTag
            return new PubSubTag(name)
        })

        behaviourObject["PSServer"]         = ((serverAddress = "127.0.0.1",serverPort = 8000)=>{
            let psServer                        = new PSServer(serverAddress,serverPort)
            behaviourObject["addPublish"]       = psServer.addPublish.bind(psServer)
            behaviourObject["addSubscriber"]    = psServer.addSubscriber.bind(psServer)
        })

        ///////////////////
        //Replication   //
        //////////////////

        behaviourObject["newRepliq"]        = ((repliqClass,...args)=>{
            let repliqOb = new repliqClass(...args)
            return repliqOb.instantiate(gspInstance,thisRef.ownerId)
        })

        ///////////////////
        //Reactivity   //
        //////////////////
        let dependencyChangeTag             = behaviourObject["newPSTag"]("DependencyChange")
        //Setup QPROP instance
        behaviourObject["QPROP"]            = (ownType : PubSubTag,directParents : Array<PubSubTag>,directChildren : Array<PubSubTag>,defaultValue : any,isDynamic = false) =>{
            let qNode       = new QPROPNode(ownType,directParents,directChildren,behaviourObject,defaultValue,dependencyChangeTag,isDynamic)
            this.base.signalPool.installDPropAlgorithm(qNode)
            let qNodeSignal = qNode.ownSignal
            let signal      = new Signal(qNodeSignal)
            qNodeSignal.setHolder(signal)
            qNodeSignal.instantiateMeta(this.base)
            signalPool.newSource(signal)
            return behaviourObject["lift"]((qSignal : QPROPSourceSignal)=>{
                return qSignal.parentVals
            })(qNodeSignal)
        }

        behaviourObject["addDependency"]    = (fromType : PubSubTag,toType : PubSubTag) => {
            behaviourObject["publish"](new DependencyChange(fromType,toType),dependencyChangeTag)
        }

        behaviourObject["SIDUP"]            = (ownType : PubSubTag,parents : Array<PubSubTag>,admitterType : PubSubTag,isSink = false) =>{
            let sidupNode   = new SIDUPNode(ownType,parents,behaviourObject,admitterType,isSink)
            this.base.signalPool.installDPropAlgorithm(sidupNode)
            let sidupSignal = sidupNode.ownSignal
            let signal      = new Signal(sidupSignal)
            sidupSignal.setHolder(signal)
            sidupSignal.instantiateMeta(this.base)
            signalPool.newSource(signal)
            return behaviourObject["lift"]((sidupSignal : SIDUPSourceSignal)=>{
                return sidupSignal.parentVals
            })(sidupSignal)
        }

        behaviourObject["SIDUPAdmitter"]    = (admitterType : PubSubTag,sources,sinks,idleListener : Function = () => {},changeListener: Function = () => {},admitListener : Function = () => {}) => {
            let adm = new SIDUPAdmitter(admitterType,sources,sinks,idleListener,changeListener,admitListener,behaviourObject)
            behaviourObject["addDependency"] = adm.addDependency.bind(adm)
        }

        //Instruct QPROP instance to publish the given signal
        behaviourObject["publishSignal"]    = (signal) => {
            (this.base.signalPool.distAlgo as QPROPNode).publishSignal(signal)
        }

        behaviourObject["newSignal"]        = (signalClass : SignalObjectClass,...args) =>{
            let sigVal = new signalClass(...args)
            let signal = new Signal(sigVal)
            sigVal.setHolder(signal)
            sigVal.instantiateMeta(this.base)
            signalPool.newSource(signal)
            return signal.value
        }
        //Automatically converts the resulting signal to weak if one of the dependencies is weak (leaves signal as strong otherwise)
        behaviourObject["lift"]             = (func) => {
            let inner = lift(func)
            return (... args) => {
                let constraintsOk = this.checkRegularLiftConstraints(...args)
                if(constraintsOk == this.CONSTRAINT_OK){
                    let sig = inner(...args)
                    let allStrong = true
                    sig.signalDependencies.forEach((dep : SignalDependency)=>{
                        allStrong = allStrong && dep.signal.strong
                    })
                    if(!allStrong){
                        signalPool.newSignal(sig)
                        sig.value.setHolder(sig)
                        sig.makeWeak()
                        return sig.value
                    }
                    else{
                        signalPool.newSignal(sig)
                        sig.value.setHolder(sig)
                        return sig.value
                    }
                }
                else{
                    throw new Error(constraintsOk)
                }

            }
        }
        //Re-wrap the lift function to catch creation of new signals as the result of lifted function application
        behaviourObject["liftStrong"]       = (func) => {
            let inner = lift(func)
            return (...args) => {
                let regularConstraints = this.checkRegularLiftConstraints(...args)
                if(regularConstraints == this.CONSTRAINT_OK){
                    let sig = inner(...args)
                    let constraint = this.checkStrongLiftConstraints(... args)
                    if(constraint != this.CONSTRAINT_OK){
                        throw new Error(constraint)
                    }
                    else{
                        signalPool.newSignal(sig)
                        sig.value.setHolder(sig)
                        return sig.value
                    }
                }
                else{
                    throw new Error(regularConstraints)
                }

            }
        }
        behaviourObject["liftWeak"]         = (func) => {
            let inner = lift(func)
            return (...args) => {
                let constraints = this.checkRegularLiftConstraints(...args)
                if(constraints == this.CONSTRAINT_OK){
                    let sig     = inner(...args)
                    signalPool.newSignal(sig)
                    sig.value.setHolder(sig)
                    sig.makeWeak()
                    return sig.value
                }
                else{
                    throw new Error(constraints)
                }

            }
        }
        behaviourObject["liftFailure"]      = (func) =>{
            let inner = liftGarbage(func)
            return (...args)=>{
                let constraint = this.checkFailureLiftConstraints(...args)
                if(constraint == this.CONSTRAINT_OK){
                    let sig     = inner(...args)
                    signalPool.newGarbageSignal(sig)
                    args.forEach((a)=>{
                        if(a instanceof SignalValue){
                            if(!a.holder.isGarbage){
                                signalPool.addGarbageDependency(a.holder.id,sig.id)
                            }
                        }
                    })
                    sig.value.setHolder(sig)
                    return sig.value
                }
                else{
                    throw new Error(constraint)
                }

            }
        }*/
        if (!appActor) {
            var initChain = this.getInitChain(behaviourObject, []);
            initChain.forEach((initFunc) => {
                initFunc.apply(behaviourObject, []);
            });
        }
    }
    receiveInvocation(sender, targetObject, methodName, args, performInvocation = () => { }) {
        performInvocation();
    }
    receiveAccess(sender, targetObject, fieldName, performAccess = () => { }) {
        performAccess();
    }
    sendInvocation(target, methodName, args, contactId = this.base.thisRef.ownerId, contactAddress = null, contactPort = null, mainId = null) {
        var promiseAlloc = this.base.promisePool.newPromise();
        let serialisedArgs = args.map((arg) => {
            return this.serialise(arg, target.ownerId, this.base);
        });
        this.send(target, target.ownerId, new Message_1.MethodInvocationMessage(this.base.thisRef, target.objectId, methodName, serialisedArgs, promiseAlloc.promiseId), contactId, contactAddress, contactPort, mainId);
        return promiseAlloc.promise;
    }
    sendAccess(target, fieldName, contactId = this.base.thisRef.ownerId, contactAddress = null, contactPort = null, mainId = null) {
        var promiseAlloc = this.base.promisePool.newPromise();
        this.send(target, target.ownerId, new Message_1.FieldAccessMessage(this.base.thisRef, target.objectId, fieldName, promiseAlloc.promiseId), contactId, contactAddress, contactPort, mainId);
        return promiseAlloc.promise;
    }
}
exports.SpiderActorMirror = SpiderActorMirror;
//# sourceMappingURL=MAP.js.map