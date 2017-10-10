///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
import {FarReference} from "./farRef";
import {Isolate, ArrayIsolate, SignalObjectClass} from "./spiders";
import {lift, liftGarbage, Signal, SignalDependency, SignalValue} from "./Reactivivity/signal";
import {ActorEnvironment} from "./ActorEnvironment";
import {PSClient} from "./PubSub/SubClient";
import {PubSubTag} from "./PubSub/SubTag";
import {PSServer} from "./PubSub/SubServer";
/**
 * Created by flo on 05/12/2016.
 */
export function isBrowser() : boolean {
    var isNode = false;
    if (typeof process === 'object') {
        if (typeof process.versions === 'object') {
            if (typeof process.versions.node !== 'undefined') {
                isNode = true;
            }
        }
    }
    return !(isNode)
}
export function generateId() : string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    })
}

//Clone function comes from stack overflow thread:
//http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
export function cloneDR(o) {
    const gdcc = "__getDeepCircularCopy__";
    if (o !== Object(o)) {
        return o; // primitive value
    }

    var set = gdcc in o,
        cache = o[gdcc],
        result;
    if (set && typeof cache == "function") {
        return cache();
    }
    // else
    o[gdcc] = function() { return result; }; // overwrite
    if (o instanceof Array) {
        result = [];
        for (var i=0; i<o.length; i++) {
            result[i] = cloneDR(o[i]);
        }

    }
    else if(o instanceof Function){
        result = o
    }
    else {
        result = {};
        Reflect.ownKeys(o).forEach((k)=>{
            if(k != gdcc){
                result[k] = cloneDR(o[k]);
            }
            else if(set){
                result[k] = cloneDR(cache);
            }
        })}
        /*for (var prop in o)
            if (prop != gdcc)
                result[prop] = cloneDR(o[prop]);
            else if (set)
                result[prop] = cloneDR(cache);
    }*/
    if (set) {
        o[gdcc] = cache; // reset
    } else {
        delete o[gdcc]; // unset again
    }
    return result;
}

//REALLY ugly way of checking whether we have reached the end of the prototype chain while cloning
function isLastPrototype(object){
    return object == null
}

export function clone(object){
    let base = cloneDR(object)
    function walkProto(proto,last){
        if(!(isLastPrototype(proto))){
            let protoClone = cloneDR(proto)
            Reflect.setPrototypeOf(last,protoClone)
            walkProto(Reflect.getPrototypeOf(proto),protoClone)
        }
    }
    walkProto(Reflect.getPrototypeOf(object),base)
    return base
}

function getInitChain(behaviourObject : any,result : Array<Function>){
    var properties = Reflect.ownKeys(behaviourObject)
    //Have reached base level object, end of prototype chain (ugly but works)
    if(properties.indexOf("init") != -1){
        result.unshift(Reflect.get(behaviourObject,"init"))
    }
    if(properties.indexOf("valueOf") !=-1){
        return result
    }
    else{
        return getInitChain(behaviourObject.__proto__,result)
    }
}

const CONSTRAINT_OK = "ok"

function checkRegularLiftConstraints(...liftArgs) : string{
    let someGarbage = false
    liftArgs.forEach((a)=>{
        if(a instanceof SignalValue){
            someGarbage = someGarbage || a.holder.isGarbage
        }
    })
    if(someGarbage){
        return "Cannot use regular lift (i.e. lift/liftStrong/liftStrong) on signal part of garbage dependency graph"
    }
    else{
        return CONSTRAINT_OK
    }
}

function checkFailureLiftConstraints(...liftArgs) : string{
    let someStrong = false
    liftArgs.forEach((a)=>{
        if(a instanceof SignalValue){
            someStrong = someStrong || a.holder.strong
        }
    })
    if(someStrong){
        return "Calling failure lift on strong signal (which will never propagate garbage collection event)"
    }
    else{
        return CONSTRAINT_OK
    }
}

function checkStrongLiftConstraints(...liftArgs) : string {
    let allStrong = true
    liftArgs.forEach((a)=>{
        if(a instanceof SignalValue){
            allStrong = allStrong && a.holder.strong
        }
    })
    if(allStrong){
        return CONSTRAINT_OK
    }
    else{
        return "Trying to create strong lifted signal with a weak dependency"
    }
}


export function installSTDLib(appActor : boolean,parentRef : FarReference,behaviourObject : Object,environment : ActorEnvironment){
    let commMedium  = environment.commMedium
    let thisRef     = environment.thisRef
    let promisePool = environment.promisePool
    let signalPool  = environment.signalPool
    let gspInstance = environment.gspInstance

    if(!appActor){
        behaviourObject["parent"]   = parentRef.proxyify()
    }
    behaviourObject["remote"]       = (address : string,port : number) : Promise<any> =>  {
        return commMedium.connectRemote(thisRef,address,port,promisePool)
    }
    behaviourObject["Isolate"]      = Isolate
    behaviourObject["ArrayIsolate"] = ArrayIsolate

    ///////////////////
    //Pub/Sub       //
    //////////////////

    behaviourObject["PSClient"]     = ((serverAddress = "127.0.0.1",serverPort = 8000) =>{
        let psClient                    = new PSClient(serverAddress,serverPort,behaviourObject)
        behaviourObject["publish"]      = psClient.publish.bind(psClient)
        behaviourObject["subscribe"]    = psClient.subscribe.bind(psClient)
        behaviourObject["newPublished"] = psClient.newPublished.bind(psClient)
    })

    behaviourObject["newPSTag"]     = ((name : string)=>{
        return new PubSubTag(name)
    })

    behaviourObject["PSServer"]     = ((serverAddress = "127.0.0.1",serverPort = 8000)=>{
        let psServer                        = new PSServer(serverAddress,serverPort)
        behaviourObject["addPublish"]       = psServer.addPublish.bind(psServer)
        behaviourObject["addSubscriber"]    = psServer.addSubscriber.bind(psServer)
    })

    ///////////////////
    //Replication   //
    //////////////////

    behaviourObject["newRepliq"]    = ((repliqClass,...args)=>{
        let repliqOb = new repliqClass(...args)
        return repliqOb.instantiate(gspInstance,thisRef.ownerId)
    })

    ///////////////////
    //Reactivity   //
    //////////////////

    behaviourObject["newSignal"]    = (signalClass : SignalObjectClass,...args) =>{
        let sigVal = new signalClass(...args)
        let signal = new Signal(sigVal)
        sigVal.setHolder(signal)
        sigVal.instantiateMeta(environment)
        signalPool.newSource(signal)
        return signal.value
    }
    //Automatically converts the resulting signal to weak if one of the dependencies is weak (leaves signal as strong otherwise)
    behaviourObject["lift"] = (func) => {
        let inner = lift(func)
        return (... args) => {
            let constraintsOk = checkRegularLiftConstraints(...args)
            if(constraintsOk == CONSTRAINT_OK){
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
    behaviourObject["liftStrong"]         = (func) => {
        let inner = lift(func)
        return (...args) => {
            let regularConstraints = checkRegularLiftConstraints(...args)
            if(regularConstraints == CONSTRAINT_OK){
                let sig = inner(...args)
                let constraint = checkStrongLiftConstraints(... args)
                if(constraint != CONSTRAINT_OK){
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
    behaviourObject["liftWeak"] = (func) => {
        let inner = lift(func)
        return (...args) => {
            let constraints = checkRegularLiftConstraints(...args)
            if(constraints == CONSTRAINT_OK){
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
    behaviourObject["liftFailure"] = (func) =>{
        let inner = liftGarbage(func)
        return (...args)=>{
            let constraint = checkFailureLiftConstraints(...args)
            if(constraint == CONSTRAINT_OK){
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
    }
    if(!appActor){
        var initChain                   = getInitChain(behaviourObject,[])
        initChain.forEach((initFunc)=>{
            initFunc.apply(behaviourObject,[])
        })
    }
}