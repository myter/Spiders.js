// Type definitions for Spiders.js
// Definitions by: Florian Myter
//export module spidersjs{
    export function bundleScope(classDefinition : Function,scope : LexScope): undefined
    export type FarRef = any
    export class LexScope{
        addElement(key : string,value : any)
    }
    export class SpiderActorMirror{
        initialise(appActor : boolean,parentRef? : FarRef)
        receiveInvocation(sender : FarRef,targetObject : Object,methodName : string,args : Array<any>,performInvocation? : ()=> undefined)
        receiveAccess(sender : FarRef,targetObject : Object,fieldName : string,performAcess? : ()=> undefined)
        sendInvocation(target : FarRef,methodName : string,args : Array<any>,contactId? : string,contactAddress? : string,contactPort? : number,mainId? : string) : Promise<any>
        sendAccess(target : FarRef,fieldName : string,contactId? : string,contactAddress? : string,contactPort? : number,mainId? : string) : Promise<any>
    }
    export class SpiderObjectMirror{
        invoke(methodName : PropertyKey,args : Array<any>)
        access(fieldName : PropertyKey)
        write(fieldName : PropertyKey,value : any)
        pass()
        resolve()
    }
    export class SpiderIsolateMirror{
        invoke(methodName : PropertyKey,args : Array<any>)
        access(fieldName : PropertyKey)
        write(fieldName : PropertyKey,value : any)
        pass()
        resolve()
    }
    export class SpiderObject{}
    export class SpiderIsolate{}
    export class Actor{
        constructor(actorMirror? : SpiderActorMirror)
    }
    export class Application{
        spawnActor(actorClass : Function,constructionArgs? : Array<any>,port? : number)
        kill()
    }
//}


