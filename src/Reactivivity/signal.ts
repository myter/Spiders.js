import {SignalContainer} from "../serialisation";
/**
 * Created by flo on 21/06/2017.
 */
var utils = require("../utils")


abstract class Dependency{
    position : number
    value

    constructor(val,position){
        this.value      = val
        this.position   = position
    }
}

class SignalDependency extends Dependency{
    signalId    : string

    constructor(signalId : string,val,position){
        super(val,position)
        this.signalId = signalId
    }
}

class StaticDependency extends Dependency{}

export class Signal{
    id                  : string
    currentVal
    evalFunc            : Function
    children            : Array<Signal>
    signalDependencies  : Map<string,SignalDependency>
    staticDependencies  : Array<StaticDependency>
    changesReceived     : number
    listeners           : Array<Function>
    //Indicates whether the signal is actually a stub for a remote signal
    foreignStub         : boolean

    constructor(initVal, evalFunc : Function = null){
        this[SignalContainer.checkSignalFuncKey]    = true
        this.id                                     = utils.generateId()
        this.currentVal                             = initVal
        this.evalFunc                               = evalFunc
        this.children                               = new Array()
        this.signalDependencies                     = new Map()
        this.staticDependencies                     = new Array()
        this.changesReceived                        = 0
        this.listeners                              = new Array()
    }

    addChild(signal : Signal){
        this.children.push(signal)
    }

    addSignalDependency(signal : Signal,position : number){
        this.signalDependencies.set(signal.id,new SignalDependency(signal.id,signal.currentVal,position))
    }

    addStaticDependency(value,position : number){
        this.staticDependencies.push(new StaticDependency(value,position))
    }

    //Called on source nodes by "external" code
    change(val){
        this.currentVal = val
        this.propagate(val)
        this.triggerExternal()
    }

    propagate(val){
        this.children.forEach((child : Signal)=>{
            child.parentChanged(this.id,val)
        })
    }

    triggerExternal(){
        this.listeners.forEach((listener)=>{
            listener()
        })
    }

    parentChanged(parentId : string,val){
        let dependency : SignalDependency = this.signalDependencies.get(parentId)
        dependency.value        = val
        this.changesReceived    += 1
        if(this.changesReceived == this.signalDependencies.size){
            let args = []
            this.signalDependencies.forEach((dep : SignalDependency)=>{
                args[dep.position] = dep.value
            })
            this.staticDependencies.forEach((dep : StaticDependency)=>{
                args[dep.position] = dep.value
            })
            this.currentVal = this.evalFunc(... args)
            this.changesReceived = 0
            this.triggerExternal()
            this.propagate(this.currentVal)
        }
    }

    //Used by Spiders.js to notify remote signals of a change
    registerListener(callback : Function){
        this.listeners.push(callback)
    }
}

export function lift(func){
    return (...args) => {
        let sig             = new Signal(null,func)
        let unwrappedArgs   = []
        args.forEach((a,i)=>{
            if(a instanceof Signal){
                a.addChild(sig)
                sig.addSignalDependency(a,i)
                unwrappedArgs.push(a.currentVal)
            }
            else{
                sig.addStaticDependency(a,i)
                unwrappedArgs.push(a)
            }
        })
        //func(... unwrappedArgs)
        return sig
    }
}