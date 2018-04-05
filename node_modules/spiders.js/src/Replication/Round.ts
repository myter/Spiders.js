/**
 * Created by flo on 16/03/2017.
 */
import {ReplicaId} from "./GSP";
import {FieldUpdate} from "./RepliqField";
import {ArrayIsolate} from "../spiders";
/**
 * Created by flo on 09/03/2017.
 */
let gspObjectIdIndex    = 0
let masterOwnerIdIndex  = 1
let roundNumberIndex    = 2
let methodNameIndex     = 3
let argsIndex           = 4
let listenerIdIndex     = 5
let updatesIndex        = 6

export function newRound(gspObjectId : ReplicaId,masterOwnerId : string,roundNumber : number,methodName : string,args : Array<any>,listenerID : string){
    let round = []
    round[gspObjectIdIndex]     = gspObjectId
    round[masterOwnerIdIndex]   = masterOwnerId
    round[roundNumberIndex]     = roundNumber
    round[methodNameIndex]      = methodName
    round[argsIndex]            = args
    round[listenerIdIndex]      = listenerID
    round[updatesIndex]         = {}
    return new ArrayIsolate(round)
}

export function addRoundUpdate(round,update : FieldUpdate,forObjectId :  string){
    //TODO forObjectId used to be part of nested Repliqs implementation
    if(!Reflect.has(round[updatesIndex],update.fieldName)){
        round[updatesIndex][update.fieldName] = []
        round.array[updatesIndex][update.fieldName] = []
    }
    round[updatesIndex][update.fieldName].push(update)
}

export function roundMasterObjectId(round){
    return round[gspObjectIdIndex]
}

export function roundMasterOwnerId(round){
    return round[masterOwnerIdIndex]
}

export function setRoundMasterOwnerId(round,newId){
    round[masterOwnerIdIndex] = newId
}

export function roundNumber(round){
    return round[roundNumberIndex]
}

export function setRoundNumber(round,newNumber){
    round[roundNumberIndex]         = newNumber
}

export function roundMethodName(round){
    return round[methodNameIndex]
}

export function roundArgs(round){
    return round[argsIndex]
}

export function roundListenerId(round){
    return round[listenerIdIndex]
}

export function roundUpdates(round){
    return round[updatesIndex]
}
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