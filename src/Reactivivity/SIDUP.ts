import {DPropAlgorithm} from "./DPropAlgorithm";
import {SignalPool} from "./signalPool";
import {mutator, Signal, SignalFunction, SignalObject} from "./signal";
import {FarRef} from "../spiders";
import {PubSubTag} from "../PubSub/SubTag";
import {IsolateContainer} from "../serialisation";

class DijkstraScholten{
    //Deficit on incoming dependencies
    c           : number
    //Deficit on outgoing edges
    d           : number
    //incoming edges
    incoming    : Array<FarRef>
    //idle state
    idle        : number
    //processing state
    processing  : number
    state       : number
    //listener to catch event of termination (used by admitter)
    listener    : Function

    constructor(listener = ()=>{}){
        this.c          = 0
        this.d          = 0
        this.incoming   = []
        this.idle       = 0
        this.processing = 1
        this.state      = this.idle
        this.listener   = listener
    }

    newParentMessage(parentRef : FarRef){
        this.state = this.processing
        this.d++
        this.incoming.push(parentRef)
    }

    newChildMessage(){
        this.state = this.processing
        this.c++
    }

    newAckMessage(){
        this.c--
        if(this.c == 0){
            this.sendAcks()
        }
    }

    nodeTerminated(){
        this.sendAcks()
    }

    sendAcks(){
        this.incoming.forEach((parentRef : FarRef)=>{
            this.d--
            parentRef.ack()
        })
        if(this.d == 0){
            this.state      = this.idle
            this.incoming   = []
            this.listener()
        }
    }

    isIdle(){
        return this.state == this.idle
    }
}

class PulseState{
    pending     : number
    unchanged   : number
    changed     : number
    state       : number

    constructor(){
        this[IsolateContainer.checkIsolateFuncKey] = true
        this.pending    = 0
        this.unchanged  = 1
        this.changed    = 2
        this.state      = this.pending
    }

    isPending(){
        return this.state == this.pending
    }

    isUnchanged(){
        return this.state == this.unchanged
    }

    isChanged(){
        return this.state == this.changed
    }

    setPending(){
        this.state = this.pending
    }

    setUnchanged(){
        this.state = this.unchanged
    }

    setChanged(){
        this.state = this.changed
    }
}

class Mirror{
    ownerType   : PubSubTag
    steadyValue : any
    pulseValue  : PulseState

    constructor(ownerType){
        //this[IsolateContainer.checkIsolateFuncKey]  = true
        this.ownerType                              = ownerType
        this.pulseValue                             = new PulseState()
    }
}

export class NodePulse{
    pulseState      : PulseState
    sourcesChanges  : Array<string>
    value           : any

    constructor(sourcesChanges,value,pulseState : PulseState){
        this[IsolateContainer.checkIsolateFuncKey]  = true
        this.sourcesChanges                         = sourcesChanges
        this.value                                  = value
        this.pulseState                             = pulseState
    }
}

class DependencyChangePulse{
    fromType    : PubSubTag
    toType      : PubSubTag

    constructor(fromType : PubSubTag,toType : PubSubTag){
        this[IsolateContainer.checkIsolateFuncKey]  = true
        this.fromType                               = fromType
        this.toType                                 = toType
    }
}

class ReachableIsolate{
    reachables : Array<string>
    constructor(reachables : Array<string>){
        this[IsolateContainer.checkIsolateFuncKey] = true
        this.reachables = reachables
    }
}

export class SIDUPAdmitter{
    termination     : DijkstraScholten
    waitingChanges  : Array<Function>
    sinks           : number
    sources         : number
    sourceRefs      : Array<FarRef>
    sinksReady      : number
    readyResolvers  : Array<Function>
    sourceResolvers : Array<Function>
    idleListener    : Function
    changeListener  : Function
    admitListener   : Function

    constructor(ownType : PubSubTag,sources: number,sinks : number,idleListener : Function,changeListener : Function,admitListener : Function,hostActor){
        this.termination        = new DijkstraScholten(()=>{this.returnedToIdle()})
        this.waitingChanges     = []
        this.sinks              = sinks
        this.sources            = sources
        this.sourceRefs         = []
        this.sinksReady         = 0
        this.readyResolvers     = []
        this.sourceResolvers    = []
        this.idleListener       = idleListener
        this.changeListener     = changeListener
        this.admitListener      = admitListener
        hostActor.publish(this,ownType)
    }

    returnedToIdle(){
        this.idleListener()
        if(this.waitingChanges.length > 0){
            let toResolve = this.waitingChanges[0]
            this.waitingChanges = this.waitingChanges.slice(1,this.waitingChanges.length)
            toResolve("ok")
            this.termination.newChildMessage()
        }

    }

    sourceChanged(withValue){
        this.admitListener()
        if(this.termination.isIdle() && this.sinksReady == this.sinks){
            this.termination.newChildMessage()
            if(this.changeListener){
                return this.changeListener(withValue)
            }
            else{
                return "ok"
            }
        }
        else{
            return new Promise((resolve)=>{
                let f = ()=>{
                    if(this.changeListener){
                        resolve(this.changeListener(withValue))
                    }
                    else{
                        resolve("ok")
                    }
                }
                this.waitingChanges.push(f)
            })
        }
    }

    ack(){
        this.termination.newAckMessage()
    }

    sinkReady(){
        this.sinksReady++
        if(this.sinksReady == this.sinks){
            console.log("graph has been constructed")
            this.readyResolvers.forEach((resolver)=>{
                resolver("ok")
            })
            this.readyResolvers = []
            //There might already be changes buffered
            this.returnedToIdle()
        }
    }

    sourceRegister(sourceRef : FarRef){
        this.sourceRefs.push(sourceRef)
        if(this.sourceRefs.length == this.sources){
            this.sourceResolvers.forEach((resolver : Function)=>{
                resolver()
            })
        }
    }

    graphReady(){
        if(this.sinksReady == this.sinks){
            return "ok"
        }
        else{
            return new Promise((resolve)=>{
                this.readyResolvers.push(resolve)
            })
        }
    }

    addDependency(fromType : PubSubTag,toType : PubSubTag){
        let initiateChange = () => {
            console.log("Initiating change. Source refs: " + this.sourceRefs.length + " total : " + this.sources )
            this.sourceRefs.forEach((sourceRef : FarRef)=>{
                this.termination.newChildMessage()
                sourceRef.addDependency(this,new DependencyChangePulse(fromType,toType))
            })
        }
        if(this.sourceRefs.length == this.sources){
            initiateChange()
        }
        else{
            this.sourceResolvers.push(initiateChange)
        }
    }
}

export class SIDUPSourceSignal extends SignalObject{
    parentVals

    @mutator
    change(parentVals){
        this.parentVals = parentVals
    }
}

export class SIDUPNode implements DPropAlgorithm{
    host
    signalPool          : SignalPool
    parents             : Array<PubSubTag>
    parentRefs          : Array<FarRef>
    childrenRefs        : Array<FarRef>
    childrenTypes       : Array<PubSubTag>
    ownSignal           : SIDUPSourceSignal
    ownType             : PubSubTag
    pulseState          : PulseState
    mirrors             : Map<string,Mirror>
    parentReachable     : Map<string,Array<string>>
    reachable           : Array<string>
    setsReceived        : number
    waiting             : Array<Function>
    termination         : DijkstraScholten
    admitterRef         : FarRef
    admitterListeners   : Array<Function>
    isSink              : boolean
    inChange            : boolean

    constructor(ownType,parents,hostActor,admitterType : PubSubTag,isSink = false){
        this.host               = hostActor
        this.ownSignal          = new SIDUPSourceSignal()
        this.parents            = parents
        this.ownType            = ownType
        this.pulseState         = new PulseState()
        this.mirrors            = new Map()
        this.parentReachable    = new Map()
        this.reachable          = []
        this.setsReceived       = 0
        this.waiting            = []
        this.parentRefs         = []
        this.childrenRefs       = []
        this.childrenTypes      = []
        this.termination        = new DijkstraScholten(() => {this.inChange = false})
        this.admitterListeners  = []
        this.isSink             = isSink
        this.inChange           = false
        hostActor.publish(this,ownType)
        hostActor.subscribe(admitterType).each((admitterRef : FarRef)=>{
            this.admitterRef = admitterRef
            if(this.parents.length == 0){
                admitterRef.sourceRegister(this)
            }
            this.admitterListeners.forEach((admitListener : Function)=>{
                admitListener()
            })
        })
        if(this.parents.length == 0){
            this.reachable.push(this.ownType.tagVal)
        }
        this.initTopology()
    }


    ////////////////////////////////////////
    // Algorithm                        ///
    ///////////////////////////////////////

    initTopology(){
        this.parents.forEach((parentType : PubSubTag)=>{
            this.mirrors.set(parentType.tagVal,new Mirror(parentType))
            this.host.subscribe(parentType).each((parentRef : FarRef)=>{
                this.parentRefs.push(parentRef)
                parentRef.getReachable(this,this.ownType).then((parentReachables : ReachableIsolate)=>{
                    //console.log("Inside: " + this.ownType.tagVal + " reachables for: " + parentType.tagVal + " = " + parentReachables.reachables)
                    this.setsReceived++
                    parentReachables.reachables.forEach((reachable : string)=>{
                        if(!(this.reachable as any).includes(reachable)){
                            this.reachable.push(reachable)
                        }
                    })
                    this.parentReachable.set(parentType.tagVal,parentReachables.reachables)
                    if(this.setsReceived == this.parents.length){
                        this.waiting.forEach((waitingResolver : Function)=>{
                            waitingResolver(new ReachableIsolate(this.reachable))
                        })
                        if(this.isSink){
                            this.sendToAdmitter(()=>{
                                this.admitterRef.sinkReady()
                            })
                        }
                    }
                })
            })
        })
    }

    newPulse(senderType : PubSubTag,senderRef : FarRef,pulse : NodePulse){
        this.termination.newParentMessage(senderRef)
        let senderMirror            = this.mirrors.get(senderType.tagVal)
        senderMirror.steadyValue    = pulse.value
        senderMirror.pulseValue     = pulse.pulseState
        let propagate               = true
        this.parents.forEach((parenType : PubSubTag)=>{
            let parentMirror = this.mirrors.get(parenType.tagVal)
            if(parentMirror.pulseValue.isPending()){
                let parentReachables    = this.parentReachable.get(parenType.tagVal)
                let commonSources       = parentReachables.filter((parentReachable : string)=>{
                    return (pulse.sourcesChanges as any).includes(parentReachable)
                })
                if(commonSources.length > 0){
                    propagate = false
                }
            }
        })
        if(propagate){
            let anyChanged  = false
            let values      = []
            this.parents.forEach((parentType : PubSubTag)=>{
                let mirror = this.mirrors.get(parentType.tagVal)
                values.push(mirror.steadyValue)
                if(mirror.pulseValue.isChanged()){
                    anyChanged = true
                }
            })
            //No need to send actual pulse here. By changing the internal signal the "propagate" method will eventually be triggered
            if(anyChanged){
                this.pulseState.setChanged()
                this.signalPool.setLastPulse(pulse)
                this.ownSignal.change(values)
            }
            else{
                this.pulseState.setUnchanged()
                this.signalPool.setLastPulse(pulse)
                this.ownSignal.holder.change(Signal.NO_CHANGE)
            }
            this.reset()
            if(this.childrenRefs.length == 0){
                this.termination.nodeTerminated()
            }
        }
    }

    reset(){
        this.pulseState.setPending()
        this.parents.forEach((parentType : PubSubTag)=>{
            let mirror = this.mirrors.get(parentType.tagVal)
            mirror.pulseValue.setPending()
        })
    }

    ////////////////////////////////////////
    // Calls made by other SIDUP nodes  ///
    ///////////////////////////////////////


    ack(){
        this.termination.newAckMessage()
    }

    getReachable(childRef : FarRef,childType : PubSubTag){
        this.childrenRefs.push(childRef)
        this.childrenTypes.push(childType)
        if(this.setsReceived == this.parents.length){
            return new ReachableIsolate(this.reachable)
        }
        else{
            return new Promise((resolve)=>{
                this.waiting.push(resolve)
            })
        }
    }

    updateReachable(isNewParent : boolean,senderRef : FarRef,senderType : PubSubTag,reachables : ReachableIsolate){
        this.termination.newParentMessage(senderRef)
        if(isNewParent){
            if(this.parentReachable.has(senderType.tagVal)){
                throw new Error("New parent already exists")
            }
            else{
                this.mirrors.set(senderType.tagVal,new Mirror(senderType))
                this.parents.push(senderType)
                this.parentRefs.push(senderRef)
                this.parentReachable.set(senderType.tagVal,reachables.reachables)
            }
        }
        else{
            let previousReachables : any = this.parentReachable.get(senderType.tagVal)
            reachables.reachables.forEach((reachable : string)=>{
                if(!previousReachables.includes(reachable)){
                    previousReachables.push(reachable)
                }
            })
        }
        reachables.reachables.forEach((reachable : string)=>{
            if(!(this.reachable as any).includes(reachable)){
                this.reachable.push(reachable)
            }
        })
        this.childrenRefs.forEach((childRef : FarRef)=>{
            this.termination.newChildMessage()
            childRef.updateReachable(false,this,this.ownType,new ReachableIsolate(this.reachable))
        })
        if(this.childrenRefs.length == 0){
            this.termination.nodeTerminated()
        }
    }

    addDependency(sender : FarRef,changePulse : DependencyChangePulse){
        this.termination.newParentMessage(sender)
        let from    = changePulse.fromType.tagVal
        let to      = changePulse.toType.tagVal
        if(from == this.ownType.tagVal && !this.inChange){
            let childTypes : any = this.childrenTypes.map((childType : PubSubTag)=>{
                return childType.tagVal
            })
            if(childTypes.includes(to)){
                throw new Error("Adding dependency which already exists")
            }
            else{
                this.childrenTypes.push(changePulse.toType)
                this.inChange = true
                this.host.subscribe(changePulse.toType).once((newChildRef : FarRef)=>{
                    this.childrenRefs.push(newChildRef)
                    this.termination.newChildMessage()
                    newChildRef.updateReachable(true,this,this.ownType,new ReachableIsolate(this.reachable))
                })
            }
        }
        else if(!this.inChange){
            this.inChange = true
            this.childrenRefs.forEach((childRef : FarRef)=>{
                this.termination.newChildMessage()
                childRef.addDependency(this,changePulse)
            })
        }
        if(this.childrenRefs.length == 0 && !(to == this.ownType.tagVal)){
            this.termination.nodeTerminated()
        }
    }

    getSignal(signal){
        //Dummy method created to exchange signal
    }

    ////////////////////////////////////////
    // Calls made by Spiders.js          ///
    ///////////////////////////////////////


    setSignalPool(signalPool: SignalPool) {
        this.signalPool = signalPool
    }

    sendToAdmitter(sendFunction : Function){
        if(this.admitterRef){
            sendFunction()
        }
        else{
            this.admitterListeners.push(sendFunction)
        }
    }

    publishSignal(signal){
        let publish = () => {
            this.childrenRefs.forEach((childRef : FarRef)=>{
                childRef.getSignal(signal)
            })
        }
        let checkAdmitter = ()=>{
            this.admitterRef.graphReady().then(()=>{
                publish()
            })
        }
        this.sendToAdmitter(checkAdmitter)
        signal.holder.onChangeListener = () => {
            this.propagate(signal.holder,[])
        }
    }

    propagate(signal: Signal, toIds: string[]) {
        let propagateToChildren = (distributedsource,newVal = signal.value) => {
            let newPulse
            //let newVal = signal.value
            if(newVal instanceof SignalFunction){
                newVal = newVal.lastVal
            }
            if(distributedsource){
                this.pulseState.setChanged()
                //console.log("Propagating to children in " + this.ownType.tagVal + " with state " + this.pulseState.state)
                newPulse            = new NodePulse([this.ownType.tagVal],newVal,this.pulseState)
            }
            else{
                let triggeringPulse = this.signalPool.lastPulse
                newPulse            = new NodePulse(triggeringPulse.sourcesChanges,newVal,this.pulseState)
            }
            this.childrenRefs.forEach((childRef : FarRef)=>{
                this.termination.newChildMessage()
                childRef.newPulse(this.ownType,this,newPulse)
            })
        }
        //Check whether this node is at the start of the distributed dependency graph
        //In which case it first needs to ask "permission" to propagate from the admitter
        if(this.parents.length == 0){
            let askAdmitter = () => {
                this.admitterRef.sourceChanged(signal.value).then((ret)=>{
                    //This code is only triggered after accept from admitter
                    this.termination.newParentMessage(this.admitterRef)
                    if(ret == "ok"){
                        propagateToChildren(true)

                    }
                    else{
                        propagateToChildren(true,ret)
                    }
                })
            }
            this.sendToAdmitter(askAdmitter)
        }
        else{
            propagateToChildren(false)
        }

    }

    propagationReceived(fromId: string, signalId: string, value: any) {
        //Not needed
    }

}