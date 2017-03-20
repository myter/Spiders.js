/**
 * Created by flo on 16/03/2017.
 */
import {ReplicaId} from "./GSP";
/**
 * Created by flo on 09/03/2017.
 */
export class FieldUpdate{
    fieldName       : string
    initVal         : any
    resVal          : any

    constructor(fieldName,initVal,resVal){
        this.fieldName  = fieldName
        this.initVal    = initVal
        this.resVal     = resVal
    }
}

export class Round{
    masterOwnerId           : string
    masterObjectId          : ReplicaId
    roundNumber             : number
    methodName              : string
    args                    : Array<any>
    updates                 : any
    listenerID              : string

    constructor(gspObjectId : ReplicaId,masterOwnerId : string,roundNumber : number,methodName : string,args : Array<any>,listenerID : string){
        this.masterObjectId         = gspObjectId
        this.masterOwnerId          = masterOwnerId
        this.roundNumber            = roundNumber
        this.methodName             = methodName
        this.args                   = args
        this.updates                = {}
        this.listenerID             = listenerID
    }

    addUpdate(update : FieldUpdate){
        if(!Reflect.has(this.updates,update.fieldName)){
            this.updates[update.fieldName] = []
        }
        this.updates[update.fieldName].push(update)
    }
}