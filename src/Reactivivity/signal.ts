import {SignalContainer} from "../serialisation";
import {Isolate} from "../spiders";
/**
 * Created by flo on 21/06/2017.
 */
var utils               = require("../utils")

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

//Used to represent the state of a signal, provided to the programmer as "Signal"
export abstract class SignalValue{
    static IS_MUTATOR   = "_IS_MUTATOR_"
    static GET_ORIGINAL = "_GET_ORIGINAL_"
    holder : Signal
    constructor(){
        this[SignalContainer.checkSignalFuncKey]    = true
    }
    setHolder(holder){
        this.holder = holder
    }
}

export function mutator(target : any,propertyKey : string,descriptor : PropertyDescriptor){
    let originalMethod = descriptor.value
    originalMethod[SignalValue.IS_MUTATOR] = true
    return {
        value : originalMethod
    }
}
export class SignalObject extends SignalValue{
    instantiateMeta(){
        let methodKeys      = Reflect.ownKeys(Object.getPrototypeOf(this))
        methodKeys.forEach((methodName)=>{
            var property    = Reflect.get(Object.getPrototypeOf(this),methodName)
            if(property[SignalValue.IS_MUTATOR]){
                let wrapped = (... args) =>{
                    property.apply(this,args,this)
                    this.holder.change()
                }
                wrapped[SignalValue.IS_MUTATOR]         = true
                wrapped[SignalValue.GET_ORIGINAL]       = property
                Object.getPrototypeOf(this)[methodName] = wrapped
            }
        })
    }

    reconstruct(){

    }
}

export class SignalFunction extends SignalValue{
    f       : Function
    lastVal : any

    constructor(f : Function){
        super()
        this.f = f
    }

    reeval(... args){
        this.lastVal = this.f(...args)
        return this.lastVal
    }
}

export class Signal{
    static NO_CHANGE    = "_NO_CHANGE_"
    id                  : string
    value               : SignalValue
    children            : Array<Signal>
    signalDependencies  : Map<string,SignalDependency>
    staticDependencies  : Array<StaticDependency>
    changesReceived     : number
    noChangesReceived   : number
    listeners           : Array<Function>
    isSource            : boolean
    //Indicates whether the signal is actually a stub for a remote signal
    foreignStub         : boolean
    //Used by leasing/backpressure features
    rateLowerBound      : number
    rateUpperBound      : number

    constructor(signalObject : SignalValue){
        //this[SignalContainer.checkSignalFuncKey]    = true
        this.id                                     = utils.generateId()
        this.value                                  = signalObject
        this.children                               = new Array()
        this.signalDependencies                     = new Map()
        this.staticDependencies                     = new Array()
        this.changesReceived                        = 0
        this.noChangesReceived                      = 0
        this.listeners                              = new Array()
        this.rateLowerBound                         = Infinity
        this.rateUpperBound                         = Infinity
        this.isSource                               = true
    }

    addChild(signal : Signal){
        this.children.push(signal)
    }

    addSignalDependency(signal : Signal,position : number){
        this.signalDependencies.set(signal.id,new SignalDependency(signal.id,signal.value,position))
        this.isSource = false
    }

    addStaticDependency(value,position : number){
        this.staticDependencies.push(new StaticDependency(value,position))
        this.isSource = false
    }

    //Called on source nodes by "external" code
    change(val = null){
        if(val == Signal.NO_CHANGE){
            this.propagate(val)
        }
        //Can only happen if a remote signal changed which wasn't a source signal (i.e. result of lifted function)
        else if(val instanceof SignalFunction){
            (this.value as SignalFunction).lastVal = val.lastVal
            this.propagate(val.lastVal)
            this.triggerExternal()
        }
        //Remote signal changed the object representing the signal's state
        else if(val instanceof SignalObject){
            this.value = val
            this.propagate(this.value)
            this.triggerExternal()
        }
        //Local change, object (i.e. this.value) has been mutated
        else{
            this.propagate(this.value)
            this.triggerExternal()
        }
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
        this.changesReceived    += 1
        let dependency : SignalDependency = this.signalDependencies.get(parentId)
        if(val == Signal.NO_CHANGE){
            this.noChangesReceived += 1
        }
        else{
            dependency.value        = val
        }
        if(this.changesReceived == this.signalDependencies.size && this.noChangesReceived != this.signalDependencies.size){
            let args = []
            this.signalDependencies.forEach((dep : SignalDependency)=>{
                args[dep.position] = dep.value
            })
            this.staticDependencies.forEach((dep : StaticDependency)=>{
                args[dep.position] = dep.value
            })
            //If the signal has parents it cannot be source and must therefore have a function as value object
            let ret         = (this.value as SignalFunction).reeval(... args)
            //TODO check whether ret is an object. If this is the case, turn it into SignalObjectValue
            this.changesReceived    = 0
            this.noChangesReceived  = 0
            this.triggerExternal()
            this.propagate(ret)
        }
        else if(this.noChangesReceived == this.signalDependencies.size){
            this.noChangesReceived  = 0
            this.changesReceived    = 0
            this.propagate(Signal.NO_CHANGE)
        }
    }

    //Used by Spiders.js to notify remote signals of a change
    registerListener(callback : Function){
        this.listeners.push(callback)
    }
}

export function lift(func : Function){
    return (...args) => {
        let sig             = new Signal(new SignalFunction(func))
        args.forEach((a,i)=>{
            if(a instanceof SignalValue){
                a.holder.addChild(sig)
                sig.addSignalDependency(a.holder,i)
            }
            else{
                sig.addStaticDependency(a,i)
            }
        })
        return sig
    }
}