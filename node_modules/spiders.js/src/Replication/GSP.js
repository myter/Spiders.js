/**
 * Created by flo on 16/03/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Message_1 = require("../Message");
const Repliq_1 = require("./Repliq");
const Round_1 = require("./Round");
var utils = require("../utils");
class GSP {
    //Checks whether this instance is master of a given gsp object (using the gsp object's owner id)
    isMaster(anId) {
        return anId == this.thisActorId;
    }
    playRound(round) {
        //Replay changes for top-level Repliq
        let object = this.repliqs.get(Round_1.roundMasterObjectId(round));
        let fields = object[Repliq_1.Repliq.getRepliqFields];
        Reflect.ownKeys(Round_1.roundUpdates(round)).forEach((fieldName) => {
            fields.get(fieldName).update(Reflect.get(Round_1.roundUpdates(round), fieldName));
        });
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
    constructor(thisActorId, environment) {
        this.thisActorId = thisActorId;
        this.environment = environment;
        //TODO Initialisisation of fields will be refactored together with communication
        this.thisActorAddress = this.environment.thisRef.ownerAddress;
        this.thisActorPort = this.environment.thisRef.ownerPort;
        this.repliqs = new Map();
        this.current = new Map();
        this.pending = new Map();
        this.committed = new Map();
        this.roundNumbers = new Map();
        this.replicaOwners = new Map();
        this.replay = [];
        this.roundCommitListeners = new Map();
        this.forwardingM = new Map();
        this.forwardingS = new Map();
    }
    //////////////////////////////////
    //Methods invoked by Repliqs    //
    //////////////////////////////////
    newMasterRepliq(repliqProxy, repliqId) {
        this.repliqs.set(repliqId, repliqProxy);
    }
    inReplay(objectId) {
        return this.replay.includes(objectId);
    }
    newRound(objectId, ownerId, methodName, args) {
        //Round number will be determined upon Yield by the master
        let roundNumber = -1;
        let listenerID = utils.generateId();
        let round = Round_1.newRound(objectId, ownerId, roundNumber, methodName, args, listenerID);
        this.current.set(objectId, round);
        return round;
    }
    registerRoundListener(callback, listenerID) {
        if (!this.roundCommitListeners.has(listenerID)) {
            this.roundCommitListeners.set(listenerID, []);
        }
        this.roundCommitListeners.get(listenerID).push(callback);
    }
    //Called at the end of a method invocation on a gsp object
    yield(objectId, ownerId) {
        if (this.isMaster(ownerId)) {
            this.yieldMasterRound(this.current.get(objectId));
        }
        else {
            this.yieldReplicaRound(this.current.get(objectId));
        }
    }
    yieldMasterRound(round) {
        //Commit round on the master
        if (!this.roundNumbers.has(Round_1.roundMasterObjectId(round))) {
            this.roundNumbers.set(Round_1.roundMasterObjectId(round), 0);
        }
        let prevRoundNumber = this.roundNumbers.get(Round_1.roundMasterObjectId(round));
        Round_1.setRoundNumber(round, prevRoundNumber + 1);
        this.roundNumbers.set(Round_1.roundMasterObjectId(round), prevRoundNumber + 1);
        this.commitRound(round);
        //Broadcast round to all holders of replicaOwners
        if (this.replicaOwners.has(Round_1.roundMasterObjectId(round))) {
            this.replicaOwners.get(Round_1.roundMasterObjectId(round)).forEach((replicaHolderId) => {
                this.environment.commMedium.sendMessage(replicaHolderId, new Message_1.GSPRoundMessage(this.environment.thisRef, round));
            });
        }
    }
    yieldReplicaRound(round) {
        //A replica just finished performing updates.
        //Add these updates to the pending map and sent the round to the master
        if (!this.pending.has(Round_1.roundMasterObjectId(round))) {
            this.pending.set(Round_1.roundMasterObjectId(round), []);
        }
        this.pending.get(Round_1.roundMasterObjectId(round)).push(round);
        this.environment.commMedium.sendMessage(Round_1.roundMasterOwnerId(round), new Message_1.GSPRoundMessage(this.environment.thisRef, round));
    }
    confirmMasterRound(round) {
        if (!this.roundNumbers.has(Round_1.roundMasterObjectId(round))) {
            this.roundNumbers.set(Round_1.roundMasterObjectId(round), 0);
        }
        //console.log("Confirming master round: " + roundNumber(round) + " for object id: " + roundMasterObjectId(round))
        //console.log("Last known round: " + this.roundNumbers.get(roundMasterObjectId(round)))
        if (Round_1.roundNumber(round) == this.roundNumbers.get(Round_1.roundMasterObjectId(round)) + 1) {
            //Remove all older pending rounds
            if (this.pending.has(Round_1.roundMasterObjectId(round))) {
                let res = this.pending.get(Round_1.roundMasterObjectId(round)).filter((pendingRound) => {
                    return Round_1.roundNumber(pendingRound) > Round_1.roundNumber(round);
                });
                this.pending.set(Round_1.roundMasterObjectId(round), res);
            }
            //Commit the round
            this.commitRound(round);
            //Update the last known round number for the replicated object
            this.roundNumbers.set(Round_1.roundMasterObjectId(round), Round_1.roundNumber(round));
        }
        else {
            //We missed a number of rounds, request owner of master object to sync with us
            this.environment.commMedium.sendMessage(Round_1.roundMasterOwnerId(round), new Message_1.GSPSyncMessage(this.environment.thisRef, this.thisActorId, Round_1.roundMasterObjectId(round)));
        }
    }
    commitRound(round) {
        //1) Set concerned object on replay modus (i.e. reset concerned fields to commited values)
        this.replay.push(Round_1.roundMasterObjectId(round));
        let object = this.repliqs.get(Round_1.roundMasterObjectId(round));
        object[Repliq_1.Repliq.resetRepliqCommit](Round_1.roundUpdates(round));
        //reset to commit for inner repliqs
        /*Reflect.ownKeys(round.innerUpdates).forEach((innerId)=>{
            if(this.repliqs.has(innerId.toString())){
                let innerRep = this.repliqs.get(innerId.toString())
                let updates  = round.innerUpdates[innerId]
                innerRep[Repliq.resetRepliqCommit](updates)
            }
        })*/
        //2) Replay the round on the object. Depending on the field implementation this will commit tentative values
        this.playRound(round);
        //3) Commit all tentative values as a result fo the replay
        object[Repliq_1.Repliq.commitRepliq](Round_1.roundUpdates(round));
        //Commit all tentative values of inner Repliqs
        /*Reflect.ownKeys(round.innerUpdates).forEach((innerId)=>{
            if(this.repliqs.has(innerId.toString())){
                let innerRep = this.repliqs.get(innerId.toString())
                let updates  = round.innerUpdates[innerId]
                innerRep[Repliq.commitRepliq](updates)
            }
        })*/
        //4) Play pending rounds
        if (this.pending.has(Round_1.roundMasterObjectId(round))) {
            this.pending.get(Round_1.roundMasterObjectId(round)).forEach((round) => {
                this.playRound(round);
            });
        }
        //5) Add round to commit
        if (!this.committed.has(Round_1.roundMasterObjectId(round))) {
            this.committed.set(Round_1.roundMasterObjectId(round), []);
        }
        this.committed.get(Round_1.roundMasterObjectId(round)).push(round);
        this.replay = this.replay.filter((oId) => {
            oId != Round_1.roundMasterObjectId(round);
        });
        //6) trigger all onceCommited listeners for this round
        this.triggerCommitListeners(Round_1.roundListenerId(round));
    }
    triggerCommitListeners(listenerID) {
        if (this.roundCommitListeners.has(listenerID)) {
            this.roundCommitListeners.get(listenerID).forEach((callback) => {
                callback();
            });
        }
    }
    /////////////////////////////////////////////
    //Methods invoked by the network interface //
    /////////////////////////////////////////////
    registerReplica(replicaId, replica) {
        this.repliqs.set(replicaId, replica);
        this.environment.commMedium.sendMessage(replica[Repliq_1.Repliq.getRepliqOwnerID], new Message_1.GSPRegisterMessage(this.environment.thisRef, this.thisActorId, replicaId, this.thisActorAddress, this.thisActorPort, this.roundNumbers.get(replicaId)));
    }
    registerReplicaHolder(replicaId, holderId, roundNr) {
        if (!this.replicaOwners.has(replicaId)) {
            this.replicaOwners.set(replicaId, []);
        }
        this.replicaOwners.get(replicaId).push(holderId);
        //Added for p2p
        if (this.forwardingM.has(replicaId)) {
            if (!this.forwardingS.has(replicaId)) {
                this.forwardingS.set(replicaId, []);
            }
            this.forwardingS.get(replicaId).push(holderId);
        }
        //
        if (this.committed.has(replicaId) && roundNr < this.roundNumbers.get(replicaId)) {
            this.committed.get(replicaId).forEach((round) => {
                this.environment.commMedium.sendMessage(holderId, new Message_1.GSPRoundMessage(this.environment.thisRef, round));
            });
        }
    }
    roundReceived(round, senderId) {
        if (this.isMaster(Round_1.roundMasterOwnerId(round))) {
            //added for p2p
            if (this.forwardingM.has(Round_1.roundMasterObjectId(round))) {
                Round_1.setRoundMasterOwnerId(round, this.forwardingM.get(Round_1.roundMasterObjectId(round)));
                this.environment.commMedium.sendMessage(this.forwardingM.get(Round_1.roundMasterObjectId(round)), new Message_1.GSPRoundMessage(this.environment.thisRef, round));
            }
            else {
                //
                this.yieldMasterRound(round);
            }
        }
        else {
            //Added for p2p
            if (this.forwardingM.has(Round_1.roundMasterObjectId(round))) {
                //Original master has confirmed a round
                if (senderId == this.forwardingM.get(Round_1.roundMasterObjectId(round))) {
                    this.confirmMasterRound(round);
                    this.forwardingS.get(Round_1.roundMasterObjectId(round)).forEach((slaveId) => {
                        this.environment.commMedium.sendMessage(slaveId, new Message_1.GSPRoundMessage(this.environment.thisRef, round));
                    });
                }
                else {
                    let originalOwner = this.forwardingM.get(Round_1.roundMasterObjectId(round));
                    this.environment.commMedium.sendMessage(originalOwner, new Message_1.GSPRoundMessage(this.environment.thisRef, round));
                }
            }
            else {
                this.confirmMasterRound(round);
            }
        }
    }
    receiveSync(sender, masterObjectId) {
        this.committed.get(masterObjectId).forEach((round) => {
            this.environment.commMedium.sendMessage(sender, new Message_1.GSPRoundMessage(this.environment.thisRef, round));
        });
    }
    addForward(replicaId, ownerId) {
        this.forwardingM.set(replicaId, ownerId);
    }
}
exports.GSP = GSP;
//# sourceMappingURL=GSP.js.map