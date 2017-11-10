Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../spiders");
/**
 * Created by flo on 09/03/2017.
 */
let gspObjectIdIndex = 0;
let masterOwnerIdIndex = 1;
let roundNumberIndex = 2;
let methodNameIndex = 3;
let argsIndex = 4;
let listenerIdIndex = 5;
let updatesIndex = 6;
function newRound(gspObjectId, masterOwnerId, roundNumber, methodName, args, listenerID) {
    let round = [];
    round[gspObjectIdIndex] = gspObjectId;
    round[masterOwnerIdIndex] = masterOwnerId;
    round[roundNumberIndex] = roundNumber;
    round[methodNameIndex] = methodName;
    round[argsIndex] = args;
    round[listenerIdIndex] = listenerID;
    round[updatesIndex] = {};
    return new spiders_1.ArrayIsolate(round);
}
exports.newRound = newRound;
function addRoundUpdate(round, update, forObjectId) {
    //TODO forObjectId used to be part of nested Repliqs implementation
    if (!Reflect.has(round[updatesIndex], update.fieldName)) {
        round[updatesIndex][update.fieldName] = [];
        round.array[updatesIndex][update.fieldName] = [];
    }
    round[updatesIndex][update.fieldName].push(update);
}
exports.addRoundUpdate = addRoundUpdate;
function roundMasterObjectId(round) {
    return round[gspObjectIdIndex];
}
exports.roundMasterObjectId = roundMasterObjectId;
function roundMasterOwnerId(round) {
    return round[masterOwnerIdIndex];
}
exports.roundMasterOwnerId = roundMasterOwnerId;
function setRoundMasterOwnerId(round, newId) {
    round[masterOwnerIdIndex] = newId;
}
exports.setRoundMasterOwnerId = setRoundMasterOwnerId;
function roundNumber(round) {
    return round[roundNumberIndex];
}
exports.roundNumber = roundNumber;
function setRoundNumber(round, newNumber) {
    round[roundNumberIndex] = newNumber;
}
exports.setRoundNumber = setRoundNumber;
function roundMethodName(round) {
    return round[methodNameIndex];
}
exports.roundMethodName = roundMethodName;
function roundArgs(round) {
    return round[argsIndex];
}
exports.roundArgs = roundArgs;
function roundListenerId(round) {
    return round[listenerIdIndex];
}
exports.roundListenerId = roundListenerId;
function roundUpdates(round) {
    return round[updatesIndex];
}
exports.roundUpdates = roundUpdates;
/*export class Round{
    masterOwnerId           : string
    masterObjectId          : ReplicaId
    innerUpdates            : any
    roundNumber             : number
    methodName              : string
    args                    : Array<any>
    updates                 : any
    listenerID              : string

    constructor(gspObjectId : ReplicaId,masterOwnerId : string,roundNumber : number,methodName : string,args : Array<any>,listenerID : string){
        this.masterObjectId         = gspObjectId
        this.innerUpdates           = {}
        this.masterOwnerId          = masterOwnerId
        this.roundNumber            = roundNumber
        this.methodName             = methodName
        this.args                   = args
        this.updates                = {}
        this.listenerID             = listenerID
    }

    addUpdate(update : FieldUpdate,forObjectId : string){
        if(forObjectId == this.masterObjectId){
            if(!Reflect.has(this.updates,update.fieldName)){
                this.updates[update.fieldName] = []
            }
            this.updates[update.fieldName].push(update)
        }
        else{
            if(!Reflect.has(this.innerUpdates,forObjectId)){
                this.innerUpdates[forObjectId] = {}
            }
            if(!Reflect.has(this.innerUpdates[forObjectId],update.fieldName)){
                this.innerUpdates[forObjectId][update.fieldName] = []
            }
            this.innerUpdates[forObjectId][update.fieldName].push(update)
        }
    }
}*/ 
//# sourceMappingURL=Round.js.map