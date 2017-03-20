import {FieldUpdate} from "./Round";
/**
 * Created by flo on 16/03/2017.
 */
export class RepliqField<T>{
    name                : string
    tentative           : T
    commited            : T
    commitListeners     : Array<Function>
    tentativeListeners  : Array<Function>

    read() : T{
        return this.tentative
    }

    writeField(newValue : T){
        this.tentative = newValue
    }

    resetToCommit(){
        this.tentative = this.commited
    }

    commit(){
        this.commited = this.tentative
        this.triggerCommit()
    }

    update(updates : Array<FieldUpdate>){
        updates.forEach((update : FieldUpdate)=>{
            this.tentative = update.resVal
        })
        this.triggerTentative()
    }

    onCommit(callback){
        this.commitListeners.push(callback)
    }

    triggerCommit(){
        this.commitListeners.forEach((callback)=>{
            callback(this.commited)
        })
    }

    onTentative(callback){
        this.tentativeListeners.push(callback)
    }

    triggerTentative(){
        this.tentativeListeners.forEach((callback)=>{
            callback(this.tentative)
        })
    }

    constructor(name : string,value : T){
        this.name               = name
        this.tentative          = value
        this.commited           = value
        this.tentativeListeners = []
        this.commitListeners    = []
    }
}

export class RepliqCountField extends RepliqField<number>{
    update(updates : Array<FieldUpdate>){
        this.tentative += updates.length
    }
}