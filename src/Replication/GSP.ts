/**
 * Created by flo on 16/03/2017.
 */
import {Round} from "./Round";
import {CommMedium} from "../commMedium";
import {FarReference, ServerFarReference} from "../farRef";
import {GSPRoundMessage, GSPSyncMessage, GSPRegisterMessage} from "../messages";
import {Repliq} from "./Repliq";
var utils = require("../utils")
/**
 * Created by flo on 09/03/2017.
 */
//Sending around replicaOwners (i.e. GSP Objects) is the task of the NetworkInterface implementer.

export type ReplicaId               = string
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
        let object = this.repliqs.get(round.masterObjectId)
        let fields = object[Repliq.getRepliqFields]
        Reflect.ownKeys(round.updates).forEach((fieldName)=>{
            fields.get(fieldName).update(Reflect.get(round.updates,fieldName))
        })
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
        let round = new Round(objectId,ownerId,roundNumber,methodName,args,listenerID)
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
        if(!this.roundNumbers.has(round.masterObjectId)){
            this.roundNumbers.set(round.masterObjectId,0)
        }
        let prevRoundNumber = this.roundNumbers.get(round.masterObjectId)
        round.roundNumber = prevRoundNumber + 1
        this.roundNumbers.set(round.masterObjectId,prevRoundNumber + 1)
        this.commitRound(round)
        //Broadcast round to all holders of replicaOwners
        if(this.replicaOwners.has(round.masterObjectId)){
            this.replicaOwners.get(round.masterObjectId).forEach((replicaHolderId : string)=>{
                this.commMedium.sendMessage(replicaHolderId,new GSPRoundMessage(this.thisRef,round))
            })
        }
    }

    yieldReplicaRound(round : Round){
        //A replica just finished performing updates.
        //Add these updates to the pending map and sent the round to the master
        if(!this.pending.has(round.masterObjectId)){
            this.pending.set(round.masterObjectId,[])
        }
        this.pending.get(round.masterObjectId).push(round)
        this.commMedium.sendMessage(round.masterOwnerId,new GSPRoundMessage(this.thisRef,round))
    }

    confirmMasterRound(round : Round){
        if(!this.roundNumbers.has(round.masterObjectId)){
            this.roundNumbers.set(round.masterObjectId,0)
        }
        if(round.roundNumber == this.roundNumbers.get(round.masterObjectId) + 1){
            //Remove all older pending rounds
            if(this.pending.has(round.masterObjectId)){
                let res = this.pending.get(round.masterObjectId).filter((pendingRound : Round)=>{
                    pendingRound.roundNumber > round.roundNumber
                })
                this.pending.set(round.masterObjectId,res)
            }
            //Commit the round
            this.commitRound(round)
            //Update the last known round number for the replicated object
            this.roundNumbers.set(round.masterObjectId,round.roundNumber)
        }
        else{
            //We missed a number of rounds, request owner of master object to sync with us
            this.commMedium.sendMessage(round.masterOwnerId,new GSPSyncMessage(this.thisRef,this.thisActorId,round.masterObjectId))
        }
    }

    commitRound(round : Round){
        //1) Set concerned object on replay modus (i.e. reset concerned fields to commited values)
        this.replay.push(round.masterObjectId)
        let object = this.repliqs.get(round.masterObjectId)
        object[Repliq.resetRepliqCommit](round.updates)
        //2) Replay the round on the object. Depending on the field implementation this will commit tentative values
        this.playRound(round)
        //3) Commit all tentative values as a result fo the replay
        object[Repliq.commitRepliq](round.updates)
        //4) Play pending rounds
        if(this.pending.has(round.masterObjectId)){
            this.pending.get(round.masterObjectId).forEach((round : Round)=>{
                this.playRound(round)
            })
        }
        //5) Add round to commit
        if(!this.committed.has(round.masterObjectId)){
            this.committed.set(round.masterObjectId,[])
        }
        this.committed.get(round.masterObjectId).push(round)
        this.replay = this.replay.filter((oId)=>{
            oId != round.masterObjectId
        })
        //6) trigger all onceCommited listeners for this round
        this.triggerCommitListeners(round.listenerID)
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
        if(this.isMaster(round.masterOwnerId)){
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