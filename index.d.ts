// Type definitions for Spiders.js
// Definitions by: Florian Myter
import {ActorEnvironment} from "./src/ActorEnvironment";
import {PSClient} from "./src/PubSub/SubClient";
import {PSServer} from "./src/PubSub/SubServer";
import {PubSubTag} from "./src/PubSub/SubTag";

export function bundleScope(classDefinition : Function, scope : LexScope): undefined
export type FarRef<T>   = T
export type PSClient    = PSClient
export type PSServer    = PSServer
export type PubSubTag   = PubSubTag
export class ActorSTDLib{
    PubSubTag : {new(tagVal : string) : PubSubTag}
    setupPSClient(address? : string,port? : number) : PSClient
    setupPSServer()
    remote(address : string,port : number) : Promise<FarRef<any>>
    buffRemote(address : string,port : number) : FarRef<any>
    reflectOnActor() : SpiderActorMirror
    reflectOnObject(obj : SpiderObject | SpiderIsolate) : SpiderObjectMirror | SpiderIsolateMirror
    serveApp(pathToHtml : string,pathToClientScript : string,bundleName : string,httpPort : number)
}
export class LexScope{
    addElement(key : string,value : any)
}
export class SpiderActorMirror{
    base : ActorEnvironment
    initialise(stdLib : ActorSTDLib,appActor : boolean,parentRef? : FarRef<any>)
    receiveInvocation(sender : FarRef<any>,targetObject : Object,methodName : string,args : Array<any>,performInvocation? : ()=> any,sendReturn? : (returnVal : any)=>any)
    receiveAccess(sender : FarRef<any>,targetObject : Object,fieldName : string,performAcess? : ()=> undefined)
    sendInvocation(target : FarRef<any>,methodName : string,args : Array<any>,contactId? : string,contactAddress? : string,contactPort? : number,mainId? : string) : Promise<any>
    sendAccess(target : FarRef<any>,fieldName : string,contactId? : string,contactAddress? : string,contactPort? : number,mainId? : string) : Promise<any>
}
export class SpiderObjectMirror{
    base : SpiderObject
    invoke(methodName : PropertyKey,args : Array<any>)
    access(fieldName : PropertyKey)
    write(fieldName : PropertyKey,value : any)
    pass(hostActorMirror : SpiderActorMirror)
    resolve(hostActorMirror : SpiderActorMirror)
}
export class SpiderIsolateMirror{
    base : SpiderIsolate
    invoke(methodName : PropertyKey,args : Array<any>)
    access(fieldName : PropertyKey)
    write(fieldName : PropertyKey,value : any)
    pass(hostActorMirror : SpiderActorMirror)
    resolve(hostActorMirror : SpiderActorMirror)
}
export class SpiderObject{
    constructor(objectMirror? : SpiderObjectMirror)
}
export class SpiderIsolate{
    constructor(isolateMirror? : SpiderIsolateMirror)
}
export class Actor{
    parent          : FarRef<any>
    libs            : ActorSTDLib
    constructor(actorMirror? : SpiderActorMirror)
}
export class Application{
    libs : ActorSTDLib
    constructor(actorMirror? : SpiderActorMirror,address? : string,port? : number)
    spawnActor<T>(actorClass : Function,constructionArgs? : Array<any>,port? : number) : FarRef<T>
    spawnActorFromFile<T>(path : string,className : string,constructorArgs? : Array<any>,port? : number) : FarRef<T>
    kill()
}


