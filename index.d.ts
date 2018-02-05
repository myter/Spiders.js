// Type definitions for Spiders.js
// Definitions by: Florian Myter
//export module spidersjs{
    import {ActorEnvironment} from "./src/ActorEnvironment";

export function bundleScope(classDefinition : Function, scope : LexScope): undefined
    export type FarRef = any
    export class LexScope{
        addElement(key : string,value : any)
    }
    export class SpiderActorMirror{
        base : ActorEnvironment
        initialise(appActor : boolean,parentRef? : FarRef)
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
        parent : FarRef
        constructor(actorMirror? : SpiderActorMirror)
        remote : (address : string,port : number)=>Promise<FarRef>
        reflectOnActor : ()=>SpiderActorMirror
        reflectOnObject : (obj : SpiderObject | SpiderIsolate)=>SpiderObjectMirror | SpiderIsolateMirror
    }
    export class Application{
        spawnActor(actorClass : Function,constructionArgs? : Array<any>,port? : number)
        spawnActorFromFile(path : string,className : string,constructorArgs? : Array<any>,port? : number)
        kill()
    }
//}


