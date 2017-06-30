///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
import {FarReference, ServerFarReference, ClientFarReference} from "./farRef";
import {CommMedium} from "./commMedium";
import {PromisePool} from "./PromisePool";
import {Message, RouteMessage} from "./messages";
import {MessageHandler} from "./messageHandler";
import {Isolate, ArrayIsolate} from "./spiders";
import {GSP} from "./Replication/GSP";
import {lift, Signal} from "./Reactivivity/signal";
import {SignalPool} from "./Reactivivity/signalPool";
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


export function installSTDLib(appActor : boolean,thisRef : FarReference,parentRef : FarReference,behaviourObject : Object,commMedium : CommMedium,promisePool : PromisePool,gspInstance : GSP,signalPool : SignalPool){
    if(!appActor){
        behaviourObject["parent"]   = parentRef.proxyify()
    }
    behaviourObject["remote"]       = (address : string,port : number) : Promise<any> =>  {
        return commMedium.connectRemote(thisRef,address,port,promisePool)
    }
    behaviourObject["Isolate"]      = Isolate
    behaviourObject["ArrayIsolate"] = ArrayIsolate
    behaviourObject["newRepliq"]    = ((repliqClass,...args)=>{
        let repliqOb = new repliqClass(...args)
        return repliqOb.instantiate(gspInstance,thisRef.ownerId)
    })
    //TODO this is probably temp and should not be exposed to the programmer ?
    behaviourObject["newSignal"]    = (initVal) =>{
        let sig = new Signal(initVal)
        signalPool.newSource(sig)
        return sig
    }
    //Re-wrap the lift function to catch creation of new signals as the result of lifted function application
    behaviourObject["lift"]         = (func) => {
        let inner = lift(func)
        return (...args) => {
            let sig = inner(...args)
            signalPool.newSignal(sig)
            return sig
        }
    }
    if(!appActor){
        var initChain                   = getInitChain(behaviourObject,[])
        initChain.forEach((initFunc)=>{
            initFunc.apply(behaviourObject,[])
        })
    }
}