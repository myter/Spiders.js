/**
 * Created by flo on 16/03/2017.
 */
import {CommMedium} from "../commMedium";
import {FarReference, ServerFarReference} from "../farRef";
import {GSPRoundMessage, GSPSyncMessage, GSPRegisterMessage} from "../messages";
import {Repliq} from "./Repliq";
import {ArrayIsolate} from "../spiders";
import {
    newRound, roundListenerId, roundMasterObjectId, roundMasterOwnerId, roundNumber, roundUpdates,
    setRoundNumber
} from "./Round";
var utils = require("../utils")
/**
 * Created by flo on 09/03/2017.
 */
//Sending around replicaOwners (i.e. GSP Objects) is the task of the NetworkInterface implementer.

export type ReplicaId               = string
type Round = ArrayIsolate
export class GSP{
    commMedium              : CommMedium
    thisActorId             : string
    //TODO temp fields, will be removed once communication has been refactored
    thisActorAddress        : string
    thisActorPort           : number
    thisRef                 : FarReference
    repliqs                 : Map<ReplicaId,Repliq>
    //Keep track of current round for each gsp object
    current                 : Map<ReplicaId,Round>
    //Object id -> array of pending rounds
    pending                 : Map<ReplicaId,Array<Round>>
    //Object id -> array of commited rounds
    committed               : Map<ReplicaId,Array<Round>>
    //Object id -> last confirmed round number
    roundNumbers            : Map<ReplicaId,number>
    //Object id -> array of known peers having a replica of a master repliq owned by this actor
    replicaOwners           : Map<ReplicaId,Array<string>>
    replay                  : Array<ReplicaId>
    //Round number -> array of callbacks to be triggered once the round is committed
    roundCommitListeners    : Map<string,Array<Function>>

    //Checks whether this instance is master of a given gsp object (using the gsp object's owner id)
    private isMaster(anId : string) : boolean{
        return anId == this.thisActorId
    }

    private playRound(round : Round){
        //Replay changes for top-level Repliq
        let object = this.repliqs.get(roundMasterObjectId(round))
        let fields = object[Repliq.getRepliqFields]
        Reflect.ownKeys(roundUpdates(round)).forEach((fieldName)=>{
            fields.get(fieldName).update(Reflect.get(roundUpdates(round),fieldName))
        })
        //Replay changes for inner Repliqs
        /*let innerObjectIds = Reflect.ownKeys(round.innerUpdates)
        innerObjectIds.forEach((repId)=>{
            if(this.repliqs.has(repId.toString())){
                let rep         = this.repliqs.get(repId.toString())
                let repFields   = rep[Repliq.getRepliqFields]
                Reflect.ownKeys(round.innerUpdates[repId]).forEach((fieldName)=>{
                    repFields.get(fieldName).update(Reflect.get(round.innerUpdates[repId],fieldName))
                })
            }
        })*/
    }


    constructor(commMedium : CommMedium,thisActorId : string,thisRef : FarReference){
        this.commMedium             = commMedium
        this.thisActorId            = thisActorId
        //TODO Initialisisation of fields will be refactored together with communication
        this.thisActorAddress       = (thisRef as ServerFarReference).ownerAddress
        this.thisActorPort          = (thisRef as ServerFarReference).ownerPort
        this.thisRef                = thisRef
        this.repliqs                = new Map()
        this.current                = new Map()
        this.pending                = new Map()
        this.committed              = new Map()
        this.roundNumbers           = new Map()
        this.replicaOwners          = new Map()
        this.replay                 = []
        this.roundCommitListeners   = new Map()
    }

    //////////////////////////////////
    //Methods invoked by Repliqs    //
    //////////////////////////////////

    newMasterRepliq(repliqProxy,repliqId : string){
        this.repliqs.set(repliqId,repliqProxy)
    }

    inReplay(objectId : ReplicaId) : boolean{
        return (this.replay as any).includes(objectId)
    }

    newRound(objectId : ReplicaId,ownerId : string,methodName : string,args : Array<any>) : Round{
        //Round number will be determined upon Yield by the master
        let roundNumber = -1
        let listenerID  = utils.generateId()
        let round = newRound(objectId,ownerId,roundNumber,methodName,args,listenerID)
        this.current.set(objectId,round)
        return round
    }

    registerRoundListener(callback : Function,listenerID : string){
        if(!this.roundCommitListeners.has(listenerID)){
            this.roundCommitListeners.set(listenerID,[])
        }
        this.roundCommitListeners.get(listenerID).push(callback)
    }

    //Called at the end of a method invocation on a gsp object
    yield(objectId : ReplicaId,ownerId : string){
        if(this.isMaster(ownerId)){
            this.yieldMasterRound(this.current.get(objectId))
        }
        else{
            this.yieldReplicaRound(this.current.get(objectId))
        }
    }

    yieldMasterRound(round : Round){
        //Commit round on the master
        if(!this.roundNumbers.has(roundMasterObjectId(round))){
            this.roundNumbers.set(roundMasterObjectId(round),0)
        }
        let prevRoundNumber = this.roundNumbers.get(roundMasterObjectId(round))
        setRoundNumber(round,prevRoundNumber + 1)
        this.roundNumbers.set(roundMasterObjectId(round),prevRoundNumber + 1)
        this.commitRound(round)
        //Broadcast round to all holders of replicaOwners
        if(this.replicaOwners.has(roundMasterObjectId(round))){
            this.replicaOwners.get(roundMasterObjectId(round)).forEach((replicaHolderId : string)=>{
                this.commMedium.sendMessage(replicaHolderId,new GSPRoundMessage(this.thisRef,round))
            })
        }
    }

    yieldReplicaRound(round : Round){
        //A replica just finished performing updates.
        //Add these updates to the pending map and sent the round to the master
        if(!this.pending.has(roundMasterObjectId(round))){
            this.pending.set(roundMasterObjectId(round),[])
        }
        this.pending.get(roundMasterObjectId(round)).push(round)
        this.commMedium.sendMessage(roundMasterOwnerId(round),new GSPRoundMessage(this.thisRef,round))
    }

    confirmMasterRound(round : Round){
        if(!this.roundNumbers.has(roundMasterObjectId(round))){
            this.roundNumbers.set(roundMasterObjectId(round),0)
        }
        if(roundNumber(round) == this.roundNumbers.get(roundMasterObjectId(round)) + 1){
            //Remove all older pending rounds
            if(this.pending.has(roundMasterObjectId(round))){
                let res = this.pending.get(roundMasterObjectId(round)).filter((pendingRound : Round)=>{
                    return roundNumber(pendingRound) > roundNumber(round)
                })
                this.pending.set(roundMasterObjectId(round),res)
            }
            //Commit the round
            this.commitRound(round)
            //Update the last known round number for the replicated object
            this.roundNumbers.set(roundMasterObjectId(round),roundNumber(round))
        }
        else{
            //We missed a number of rounds, request owner of master object to sync with us
            this.commMedium.sendMessage(roundMasterOwnerId(round),new GSPSyncMessage(this.thisRef,this.thisActorId,roundMasterObjectId(round)))
        }
    }

    commitRound(round : Round){
        //1) Set concerned object on replay modus (i.e. reset concerned fields to commited values)
        this.replay.push(roundMasterObjectId(round))
        let object = this.repliqs.get(roundMasterObjectId(round))
        object[Repliq.resetRepliqCommit](roundUpdates(round))
            //reset to commit for inner repliqs
        /*Reflect.ownKeys(round.innerUpdates).forEach((innerId)=>{
            if(this.repliqs.has(innerId.toString())){
                let innerRep = this.repliqs.get(innerId.toString())
                let updates  = round.innerUpdates[innerId]
                innerRep[Repliq.resetRepliqCommit](updates)
            }
        })*/
        //2) Replay the round on the object. Depending on the field implementation this will commit tentative values
        this.playRound(round)
        //3) Commit all tentative values as a result fo the replay
        object[Repliq.commitRepliq](roundUpdates(round))
            //Commit all tentative values of inner Repliqs
        /*Reflect.ownKeys(round.innerUpdates).forEach((innerId)=>{
            if(this.repliqs.has(innerId.toString())){
                let innerRep = this.repliqs.get(innerId.toString())
                let updates  = round.innerUpdates[innerId]
                innerRep[Repliq.commitRepliq](updates)
            }
        })*/
        //4) Play pending rounds
        if(this.pending.has(roundMasterObjectId(round))){
            this.pending.get(roundMasterObjectId(round)).forEach((round : Round)=>{
                this.playRound(round)
            })
        }
        //5) Add round to commit
        if(!this.committed.has(roundMasterObjectId(round))){
            this.committed.set(roundMasterObjectId(round),[])
        }
        this.committed.get(roundMasterObjectId(round)).push(round)
        this.replay = this.replay.filter((oId)=>{
            oId != roundMasterObjectId(round)
        })
        //6) trigger all onceCommited listeners for this round
        this.triggerCommitListeners(roundListenerId(round))
    }

    triggerCommitListeners(listenerID){
        if(this.roundCommitListeners.has(listenerID)){
            this.roundCommitListeners.get(listenerID).forEach((callback)=>{
                callback()
            })
        }
    }

    /////////////////////////////////////////////
    //Methods invoked by the network interface //
    /////////////////////////////////////////////

    registerReplica(replicaId : ReplicaId,replica : Repliq){
        this.repliqs.set(replicaId,replica)
        this.commMedium.sendMessage(replica[Repliq.getRepliqOwnerID],new GSPRegisterMessage(this.thisRef,this.thisActorId,replicaId,this.thisActorAddress,this.thisActorPort))
    }

    registerReplicaHolder(replicaId : ReplicaId,holderId : string){
        if(!this.replicaOwners.has(replicaId)){
            this.replicaOwners.set(replicaId,[])
        }
        this.replicaOwners.get(replicaId).push(holderId)
        if(this.committed.has(replicaId)){
            this.committed.get(replicaId).forEach((round)=>{
                this.commMedium.sendMessage(holderId,new GSPRoundMessage(this.thisRef,round))
            })
        }
    }

    roundReceived(round : Round){
        if(this.isMaster(roundMasterOwnerId(round))){
            this.yieldMasterRound(round)
        }
        else{
            this.confirmMasterRound(round)
        }
    }

    receiveSync(sender : string,masterObjectId : ReplicaId){
        this.committed.get(masterObjectId).forEach((round : Round)=>{
            this.commMedium.sendMessage(sender,new GSPRoundMessage(this.thisRef,round))
        })
    }
}