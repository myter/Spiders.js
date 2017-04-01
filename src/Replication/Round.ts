/**
 * Created by flo on 16/03/2017.
 */
import {ReplicaId} from "./GSP";
import {FieldUpdate} from "./RepliqField";
/**
 * Created by flo on 09/03/2017.
 */

export class Round{
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
}