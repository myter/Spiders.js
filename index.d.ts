// Type definitions for Spiders.js
// Definitions by: Florian Myter
import {ActorEnvironment} from "./src/ActorEnvironment";
import {PSClient} from "./src/PubSub/SubClient";
import {PSServer} from "./src/PubSub/SubServer";
import {PubSubTag} from "./src/PubSub/SubTag";

export function bundleScope(classDefinition : Function, scope : LexScope): undefined
export type FarRef      = any
export type PSClient    = PSClient
export type PSServer    = PSServer
export type PubSubTag   = PubSubTag
export class ActorSTDLib{
    PubSubTag : {new(tagVal : string) : PubSubTag}
    setupPSClient(address? : string,port? : number) : PSClient
    setupPSServer()
    remote(address : string,port : number) : Promise<FarRef>
    buffRemote(address : string,port : number) : FarRef
    reflectOnActor() : SpiderActorMirror
    reflectOnObject(obj : SpiderObject | SpiderIsolate) : SpiderObjectMirror | SpiderIsolateMirror
    serveApp(pathToHtml : string,pathToClientScript : string,bundleName : string,httpPort : number)
}
export class LexScope{
    addElement(key : string,value : any)
}
export class SpiderActorMirror{
    base : ActorEnvironment
    initialise(stdLib : ActorSTDLib,appActor : boolean,parentRef? : FarRef)
    receiveInvocation(sender : FarRef,targetObject : Object,methodName : string,args : Array<any>,performInvocation? : ()=> undefined)
    receiveAccess(sender : FarRef,targetObject : Object,fieldName : string,performAcess? : ()=> undefined)
    sendInvocation(target : FarRef,methodName : string,args : Array<any>,contactId? : string,contactAddress? : string,contactPort? : number,mainId? : string) : Promise<any>
    sendAccess(target : FarRef,fieldName : string,contactId? : string,contactAddress? : string,contactPort? : number,mainId? : string) : Promise<any>
}
export class SpiderObjectMirror{
    base : SpiderObject
    invoke(methodName : PropertyKey,args : Array<any>)
    access(fieldName : PropertyKey)
    write(fieldName : PropertyKey,value : any)
    pass()
    resolve()
}
export class SpiderIsolateMirror{
    base : SpiderIsolate
    invoke(methodName : PropertyKey,args : Array<any>)
    access(fieldName : PropertyKey)
    write(fieldName : PropertyKey,value : any)
    pass()
    resolve()
}
export class SpiderObject{
    constructor(objectMirror? : SpiderObjectMirror)
}
export class SpiderIsolate{
    constructor(isolateMirror? : SpiderIsolateMirror)
}
export class Actor{
    parent          : FarRef
    libs            : ActorSTDLib
    constructor(actorMirror? : SpiderActorMirror)
}
export class Application{
    libs : ActorSTDLib
    constructor(actorMirror? : SpiderActorMirror,address? : string,port? : number)
    spawnActor(actorClass : Function,constructionArgs? : Array<any>,port? : number)
    spawnActorFromFile(path : string,className : string,constructorArgs? : Array<any>,port? : number)
    kill()
    installTrait(ActorTrait) : undefined
    remote(address : string,port : number) : Promise<FarRef>
    reflectOnActor() : SpiderActorMirror
    reflectOnObject(obj : SpiderObject | SpiderIsolate) : SpiderObjectMirror | SpiderIsolateMirror
}


