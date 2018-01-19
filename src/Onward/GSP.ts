/**
 * Created by flo on 16/03/2017.
 */
import {Eventual} from "./Eventual";
import {FarRef} from "../spiders";
import {Round} from "./Round";
/**
 * Created by flo on 09/03/2017.
 */
type RoundClass    = {new(...args : any[]): Round}
export class GSP{
    Round                   : RoundClass
    thisActorId             : string
    eventuals               : Map<string,Eventual>
    //Keep track of current round for each gsp object
    current                 : Map<string,Round>
    //Object id -> array of pending rounds
    pending                 : Map<string,Array<Round>>
    //Object id -> array of commited rounds
    committed               : Map<string,Array<Round>>
    //Object id -> last confirmed round number
    roundNumbers            : Map<string,number>
    //Keeps track of the master owner of each eventual
    eventualOwner           : Map<string,FarRef>
    //Object id -> array of known peers having a eventual of a master eventual owned by this actor
    eventualHolders         : Map<string,Array<FarRef>>
    replay                  : Array<string>

    //Checks whether this instance is master of a given gsp object (using the gsp object's owner id)
    private isMaster(anId : string) : boolean{
        return anId == this.thisActorId
    }

    private playRound(round : Round){
        /*let object = this.repliqs.get(round.masterOwnerId)
        let fields = object[Repliq.getRepliqFields]
        Reflect.ownKeys(roundUpdates(round)).forEach((fieldName)=>{
            fields.get(fieldName).update(Reflect.get(roundUpdates(round),fieldName))
        })*/
        console.log("Replaying round for method: " + round.methodName)
    }


    constructor(thisActorId : string,Round){
        this.Round                  = Round
        this.thisActorId            = thisActorId
        this.eventuals              = new Map()
        this.current                = new Map()
        this.pending                = new Map()
        this.committed              = new Map()
        this.roundNumbers           = new Map()
        this.eventualOwner          = new Map()
        this.eventualHolders        = new Map()
        this.replay                 = []
    }

    //////////////////////////////////
    //Methods invoked by Eventuals  //
    //////////////////////////////////

    isInReplay(eventualId : string) : boolean{
        return (this.replay as any).includes(eventualId)
    }

    createRound(eventualId : string,ownerId : string,methodName : string,args : Array<any>) : Round{
        //Round number and ref will be determined upon Yield by the master
        let roundNumber = -1
        let round = new this.Round(eventualId,ownerId,roundNumber,methodName,args)
        this.current.set(eventualId,round)
        return round
    }

    //Called at the end of a method invocation on a gsp object
    yield(eventualId : string,ownerId : string){
        if(this.isMaster(ownerId)){
            this.yieldMasterRound(this.current.get(eventualId))
        }
        else{
            this.yieldReplicaRound(this.current.get(eventualId))
        }
    }

    yieldMasterRound(round : Round){
        //Commit round on the master
        if(!this.roundNumbers.has(round.objectId)){
            this.roundNumbers.set(round.objectId,0)
        }
        let prevRoundNumber = this.roundNumbers.get(round.objectId)
        round.roundNumber   = prevRoundNumber + 1
        this.roundNumbers.set(round.objectId,prevRoundNumber + 1)
        this.commitRound(round)
        //Broadcast round to all holders of replicaOwners
        if(this.eventualHolders.has(round.objectId)){
            this.eventualHolders.get(round.objectId).forEach((replicaOwner : FarRef)=>{
                replicaOwner.newRound(round)
                //this.environment.commMedium.sendMessage(replicaHolderId,new GSPRoundMessage(this.environment.thisRef,round))
            })
        }
    }

    yieldReplicaRound(round : Round){
        console.log("Yielding replica round")
        //A replica just finished performing updates.
        //Add these updates to the pending map and sent the round to the master
        if(!this.pending.has(round.objectId)){
            this.pending.set(round.objectId,[])
        }
        this.pending.get(round.objectId).push(round)
        this.eventualOwner.get(round.objectId).newRound(round)
        //this.environment.commMedium.sendMessage(roundMasterOwnerId(round),new GSPRoundMessage(this.environment.thisRef,round))
    }

    confirmMasterRound(round : Round){
        if(!this.roundNumbers.has(round.objectId)){
            this.roundNumbers.set(round.objectId,0)
        }
        if(round.roundNumber == this.roundNumbers.get(round.objectId) + 1){
            //Remove all older pending rounds
            if(this.pending.has(round.objectId)){
                let res = this.pending.get(round.objectId).filter((pendingRound : Round)=>{
                    return pendingRound.roundNumber > round.roundNumber
                })
                this.pending.set(round.objectId,res)
            }
            //Commit the round
            this.commitRound(round)
            //Update the last known round number for the replicated object
            this.roundNumbers.set(round.objectId,round.roundNumber)
        }
        else{
            //We missed a number of rounds, request owner of master object to sync with us
            this.eventualOwner.get(round.objectId).sync(round.objectId,this)
            //this.environment.commMedium.sendMessage(roundMasterOwnerId(round),new GSPSyncMessage(this.environment.thisRef,this.thisActorId,roundMasterObjectId(round)))
        }
    }

    commitRound(round : Round){
        //1) Set concerned object on replay modus (i.e. reset concerned fields to commited values)
        this.replay.push(round.objectId)
        let ev : Eventual = this.eventuals.get(round.objectId)
        console.log("Committing round for eventual " + round.objectId)
        ev.resetToCommit()
        //2) Replay the round on the object. Depending on the field implementation this will commit tentative values
        this.playRound(round)
        //3) Commit all tentative values as a result fo the replay
        ev.commit()
        //4) Play pending rounds
        if(this.pending.has(round.objectId)){
            this.pending.get(round.objectId).forEach((round : Round)=>{
                this.playRound(round)
            })
        }
        //5) Add round to commit
        if(!this.committed.has(round.objectId)){
            this.committed.set(round.objectId,[])
        }
        this.committed.get(round.objectId).push(round)
        this.replay = this.replay.filter((oId)=>{
            oId != round.objectId
        })
    }

    /////////////////////////////////////////////////////////
    //Methods invoked by the actor containing the eventual //
    /////////////////////////////////////////////////////////

    knownEventual(eventualId : string){
        return this.eventuals.has(eventualId)
    }

    registerMasterEventual(ev : Eventual){
        console.log("Registering master eventual for ev: " + ev.id + " in " + this.thisActorId)
        this.eventuals.set(ev.id,ev)
    }

    registerHolderEventual(ev : Eventual,masterRef : FarRef){
        console.log("Register holder eventual for ev: " + ev.id + " in " + this.thisActorId)
        this.eventuals.set(ev.id,ev)
        this.eventualOwner.set(ev.id,masterRef)
        masterRef.newHolder(ev.id,this.roundNumbers.get(ev.id),this)
    }

    /*registerReplica(replicaId : ReplicaId,replica : Repliq){
        this.repliqs.set(replicaId,replica)
        this.environment.commMedium.sendMessage(replica[Repliq.getRepliqOwnerID],new GSPRegisterMessage(this.environment.thisRef,this.thisActorId,replicaId,this.thisActorAddress,this.thisActorPort,this.roundNumbers.get(replicaId)))
    }*/

    newHolder(eventualId : string,holderRef : FarRef,roundNr : number){
        if(!(this.eventualHolders.has(eventualId))){
            this.eventualHolders.set(eventualId,[])
        }
        this.eventualHolders.get(eventualId).push(holderRef)
        if(this.committed.has(eventualId) && roundNr < this.roundNumbers.get(eventualId)){
            this.committed.get(eventualId).forEach((round : Round)=>{
                holderRef.newRound(round)
            })
        }
    }

    /*registerReplicaHolder(replicaId : ReplicaId,holderId : string,roundNr : number){
        if(!this.replicaOwners.has(replicaId)){
            this.replicaOwners.set(replicaId,[])
        }
        this.replicaOwners.get(replicaId).push(holderId)
        //Added for p2p
        if(this.forwardingM.has(replicaId)){
            if(!this.forwardingS.has(replicaId)){
                this.forwardingS.set(replicaId,[])
            }
            this.forwardingS.get(replicaId).push(holderId)
        }
        //
        if(this.committed.has(replicaId) && roundNr < this.roundNumbers.get(replicaId)){
            this.committed.get(replicaId).forEach((round)=>{
                this.environment.commMedium.sendMessage(holderId,new GSPRoundMessage(this.environment.thisRef,round))
            })
        }
    }*/

    newRound(round : Round){
        if(this.isMaster(round.masterOwnerId)){
            console.log("Master received round")
            this.yieldMasterRound(round)
        }
        else{
            console.log("Slave received round")
            this.confirmMasterRound(round)
        }
    }

    /*roundReceived(round : Round,senderId : string){
        if(this.isMaster(roundMasterOwnerId(round))){
            //added for p2p
            if(this.forwardingM.has(roundMasterObjectId(round))){
                setRoundMasterOwnerId(round,this.forwardingM.get(roundMasterObjectId(round)))
                this.environment.commMedium.sendMessage(this.forwardingM.get(roundMasterObjectId(round)),new GSPRoundMessage(this.environment.thisRef,round))
            }
            else{
                //
                this.yieldMasterRound(round)
            }
        }
        else{
            //Added for p2p
            if(this.forwardingM.has(roundMasterObjectId(round))){
                //Original master has confirmed a round
                if(senderId == this.forwardingM.get(roundMasterObjectId(round))){
                    this.confirmMasterRound(round)
                    this.forwardingS.get(roundMasterObjectId(round)).forEach((slaveId)=>{
                        this.environment.commMedium.sendMessage(slaveId,new GSPRoundMessage(this.environment.thisRef,round))
                    })
                }
                //Slave has yielded a round, forward it to the original master
                else{
                    let originalOwner = this.forwardingM.get(roundMasterObjectId(round))
                    this.environment.commMedium.sendMessage(originalOwner,new GSPRoundMessage(this.environment.thisRef,round))
                }
            }
            else{
                this.confirmMasterRound(round)
            }

        }
    }*/

    sync(eventualId : string,senderRef : FarRef){
        this.committed.get(eventualId).forEach((round : Round)=>{
            senderRef.newRound(round)
        })
    }

    /*receiveSync(sender : string,masterObjectId : ReplicaId){
        this.committed.get(masterObjectId).forEach((round : Round)=>{
            this.environment.commMedium.sendMessage(sender,new GSPRoundMessage(this.environment.thisRef,round))
        })
    }*/
}