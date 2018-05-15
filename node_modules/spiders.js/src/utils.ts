/**
 * Created by flo on 05/12/2016.
 */
import {SpiderIsolateMirror, SpiderObjectMirror} from "./MOP";

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
    else if (o instanceof Map){
        result = new Map()
        o.forEach((val,key)=>{
            result.set(key,cloneDR(val))
        })
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
    for (var prop in o)
        if (prop != gdcc)
            result[prop] = cloneDR(o[prop]);
        else if (set)
            result[prop] = cloneDR(cache);
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

export function getSerialiableClassDefinition(classDefinition){
    return classDefinition.toString().replace(/(\extends)(.*?)(?=\{)/,'')
}

export class ClassDefinitionChain{
    serialisedClass     : Array<string>
    classScopes         : Array<LexScope>
    methodAnnotations   : Array<Map<string,string>>
    constructor(){
        this.serialisedClass    = []
        this.classScopes        = []
        this.methodAnnotations  = []
    }

    addClass(classDefinition : string,classScope,methodAnnotations : Map<string,string>){
        this.serialisedClass.push(classDefinition)
        this.classScopes.push(classScope)
        this.methodAnnotations.push(methodAnnotations)
    }
}

export function getMethodAnnotations(classDefinition) : Map<string,string>{
    let ret         = new Map()
    let classProto  = classDefinition.prototype
    Reflect.ownKeys(classProto).forEach((key)=>{
        if(key != "constructor"){
            let meth = classProto[key]
            if(isAnnotatedMethod(meth)){
                ret.set(key.toString(),[meth["_ANNOT_CALL_"].toString(),meth["_ANNOT_TAG_"]])
            }
        }
    })
    return ret
}

export function getClassDefinitionChain(classDefinition,ignoreLast = true) : ClassDefinitionChain{
    let classDefChain = new ClassDefinitionChain()
    let loop = (currentClass) =>{
        if((Reflect.ownKeys(Reflect.getPrototypeOf(currentClass)) as any).includes("apply") && ignoreLast){
            return
        }
        else if((Reflect.ownKeys(currentClass) as any).includes("apply")){
            return
        }
        else{
            let classScope
            if(hasLexScope(currentClass)){
                classScope = currentClass[LexScope._LEX_SCOPE_KEY_]
            }
            classDefChain.addClass(getSerialiableClassDefinition(currentClass),classScope,getMethodAnnotations(currentClass))
            loop(Reflect.getPrototypeOf(currentClass))
        }
    }
    loop(classDefinition)
    return classDefChain

}

export function reconstructClassDefinitionChain(classes : Array<string>,scopes : Array<Map<string,any>>,methodAnnotations : Array<Map<string,Function>>,topClass,recreate){
    let loop =  (currentIndex,parentClass)=>{
        let classDef        = recreate(classes[currentIndex],scopes[currentIndex],parentClass)
        let classDefProto   = classDef.prototype;
        (methodAnnotations[currentIndex] as any).forEach(([annotFunc,annotTag],methName)=>{
            let method = classDefProto[methName]
            method["_ANNOT_CALL_"]  = annotFunc
            method["_ANNOT_TAG_"]   = annotTag
        })
        if(currentIndex == 0){
            return classDef
        }
        else{
            return loop(--currentIndex,classDef)
        }
    }
    return loop(classes.length-1,topClass)
}

export class LexScope{
    static _LEX_SCOPE_KEY_ = "_LEX_SCOPE_"
    scopeObjects : Map<string,any>

    constructor(){
        this.scopeObjects = new Map()
    }

    addElement(key,value){
        this.scopeObjects.set(key.toString(),value)
    }
}

export function bundleScope(classDefinition : Function, scope : LexScope){
    classDefinition[LexScope._LEX_SCOPE_KEY_] = scope
}

export function hasLexScope(classDefinition){
    return Reflect.has(classDefinition,LexScope._LEX_SCOPE_KEY_)
}

export function isAnnotatedMethod(meth) {
    return meth["_ANNOT_CALL_"]
}

export function makeMethodAnnotation(onCall : (mirror : SpiderObjectMirror | SpiderIsolateMirror,methodName : string,args : Array<any>)=>any,tag : string = ""){
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let originalMethod = descriptor.value
        originalMethod["_ANNOT_CALL_"]  = onCall
        originalMethod["_ANNOT_TAG_"]   = tag
        return {
            value : originalMethod
        }
    };
}