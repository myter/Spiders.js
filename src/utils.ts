///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
import {FarReference, ServerFarReference, ClientFarReference} from "./farRef";
import {CommMedium} from "./commMedium";
import {PromisePool} from "./PromisePool";
import {Message, RouteMessage} from "./messages";
import {MessageHandler} from "./messageHandler";
import {Isolate, ArrayIsolate} from "./spiders";
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

export function installSTDLib(thisRef : FarReference,parentRef : FarReference,behaviourObject : Object,messageHandler : MessageHandler,commMedium : CommMedium,promisePool : PromisePool){
    behaviourObject["parent"] = parentRef.proxyify()
    behaviourObject["remote"] = (address : string,port : number) : Promise<any> =>  {
        return commMedium.connectRemote(thisRef,address,port,messageHandler,promisePool)
    }
    behaviourObject["Isolate"] = Isolate
    behaviourObject["ArrayIsolate"] = ArrayIsolate
    if(Reflect.has(behaviourObject,"init")){
        behaviourObject["init"]()
    }
}