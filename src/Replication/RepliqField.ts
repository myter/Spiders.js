import {FieldUpdate} from "./Round";
/**
 * Created by flo on 16/03/2017.
 */
export class RepliqField<T>{
    name        : string
    tentative   : T
    commited    : T

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
    }

    update(updates : Array<FieldUpdate>){
        updates.forEach((update : FieldUpdate)=>{
            this.tentative = update.resVal
        })
    }

    constructor(name : string,value : T){
        this.name       = name
        this.tentative  = value
        this.commited   = value
    }
}

export class RepliqCountField extends RepliqField<number>{
    update(updates : Array<FieldUpdate>){
        this.tentative += updates.length
    }
}