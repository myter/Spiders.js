Object.defineProperty(exports, "__esModule", { value: true });
class GSP {
    //Checks whether this instance is master of a given gsp object (using the gsp object's owner id)
    isMaster(anId) {
        return anId == this.thisActorId;
    }
    playRound(round) {
        let ev = this.eventuals.get(round.objectId);
        ev[round.methodName](round.args);
    }
    constructor(thisActorId, Round) {
        this.Round = Round;
        this.thisActorId = thisActorId;
        this.eventuals = new Map();
        this.current = new Map();
        this.pending = new Map();
        this.committed = new Map();
        this.roundNumbers = new Map();
        this.eventualOwner = new Map();
        this.eventualHolders = new Map();
        this.replay = [];
    }
    //////////////////////////////////
    //Methods invoked by Eventuals  //
    //////////////////////////////////
    isInReplay(eventualId) {
        return this.replay.includes(eventualId);
    }
    createRound(eventualId, ownerId, methodName, args) {
        //Round number and ref will be determined upon Yield by the master
        let roundNumber = -1;
        let round = new this.Round(eventualId, ownerId, roundNumber, methodName, args);
        this.current.set(eventualId, round);
        return round;
    }
    //Called at the end of a method invocation on a gsp object
    yield(eventualId, ownerId) {
        if (this.isMaster(ownerId)) {
            this.yieldMasterRound(this.current.get(eventualId));
        }
        else {
            this.yieldReplicaRound(this.current.get(eventualId));
        }
    }
    yieldMasterRound(round) {
        //Commit round on the master
        if (!this.roundNumbers.has(round.objectId)) {
            this.roundNumbers.set(round.objectId, 0);
        }
        let prevRoundNumber = this.roundNumbers.get(round.objectId);
        round.roundNumber = prevRoundNumber + 1;
        this.roundNumbers.set(round.objectId, prevRoundNumber + 1);
        this.commitRound(round);
        //Broadcast round to all holders of replicaOwners
        if (this.eventualHolders.has(round.objectId)) {
            this.eventualHolders.get(round.objectId).forEach((replicaOwner) => {
                replicaOwner.newRound(round);
                //this.environment.commMedium.sendMessage(replicaHolderId,new GSPRoundMessage(this.environment.thisRef,round))
            });
        }
    }
    yieldReplicaRound(round) {
        //A replica just finished performing updates.
        //Add these updates to the pending map and sent the round to the master
        if (!this.pending.has(round.objectId)) {
            this.pending.set(round.objectId, []);
        }
        this.pending.get(round.objectId).push(round);
        this.eventualOwner.get(round.objectId).newRound(round);
        //this.environment.commMedium.sendMessage(roundMasterOwnerId(round),new GSPRoundMessage(this.environment.thisRef,round))
    }
    confirmMasterRound(round) {
        if (!this.roundNumbers.has(round.objectId)) {
            this.roundNumbers.set(round.objectId, 0);
        }
        if (round.roundNumber == this.roundNumbers.get(round.objectId) + 1) {
            //Remove all older pending rounds
            if (this.pending.has(round.objectId)) {
                let res = this.pending.get(round.objectId).filter((pendingRound) => {
                    return pendingRound.roundNumber > round.roundNumber;
                });
                this.pending.set(round.objectId, res);
            }
            //Commit the round
            this.commitRound(round);
            //Update the last known round number for the replicated object
            this.roundNumbers.set(round.objectId, round.roundNumber);
        }
        else {
            //We missed a number of rounds, request owner of master object to sync with us
            this.eventualOwner.get(round.objectId).sync(round.objectId, this);
            //this.environment.commMedium.sendMessage(roundMasterOwnerId(round),new GSPSyncMessage(this.environment.thisRef,this.thisActorId,roundMasterObjectId(round)))
        }
    }
    commitRound(round) {
        //1) Set concerned object on replay modus (i.e. reset concerned fields to commited values)
        this.replay.push(round.objectId);
        let ev = this.eventuals.get(round.objectId);
        ev.resetToCommit();
        //2) Replay the round on the object. Depending on the field implementation this will commit tentative values
        this.playRound(round);
        //3) Commit all tentative values as a result fo the replay
        ev.commit();
        //4) Play pending rounds
        if (this.pending.has(round.objectId)) {
            this.pending.get(round.objectId).forEach((round) => {
                this.playRound(round);
            });
        }
        //5) Add round to commit
        if (!this.committed.has(round.objectId)) {
            this.committed.set(round.objectId, []);
        }
        this.committed.get(round.objectId).push(round);
        this.replay = this.replay.filter((oId) => {
            oId != round.objectId;
        });
    }
    /////////////////////////////////////////////////////////
    //Methods invoked by the actor containing the eventual //
    /////////////////////////////////////////////////////////
    knownEventual(eventualId) {
        return this.eventuals.has(eventualId);
    }
    registerMasterEventual(ev) {
        this.eventuals.set(ev.id, ev);
    }
    registerHolderEventual(ev, masterRef) {
        this.eventuals.set(ev.id, ev);
        this.roundNumbers.set(ev.id, 0);
        this.eventualOwner.set(ev.id, masterRef);
        masterRef.newHolder(ev.id, this.roundNumbers.get(ev.id), this);
    }
    newHolder(eventualId, roundNr, holderRef) {
        if (!(this.eventualHolders.has(eventualId))) {
            this.eventualHolders.set(eventualId, []);
        }
        this.eventualHolders.get(eventualId).push(holderRef);
        if (this.committed.has(eventualId) && roundNr < this.roundNumbers.get(eventualId)) {
            this.committed.get(eventualId).forEach((round) => {
                holderRef.newRound(round);
            });
        }
    }
    newRound(round) {
        if (this.isMaster(round.masterOwnerId)) {
            this.yieldMasterRound(round);
        }
        else {
            this.confirmMasterRound(round);
        }
    }
    sync(eventualId, senderRef) {
        this.committed.get(eventualId).forEach((round) => {
            senderRef.newRound(round);
        });
    }
}
exports.GSP = GSP;
//# sourceMappingURL=GSP.js.map