/**
 * Created by flo on 30/03/2017.
 */

export abstract class FieldUpdate{
    fieldName : string
    constructor(fieldName){
        this.fieldName = fieldName
    }
}

export abstract class RepliqField<T>{
    name                : string
    commitListeners     : Array<Function>
    tentativeListeners  : Array<Function>
    commited            : T
    tentative           : T

    constructor(name){
        this.commitListeners    = []
        this.tentativeListeners = []
        this.name               = name
    }
    abstract read() : T

    abstract writeField(newValue : T)

    resetToCommit(){
        this.tentative = this.commited
    }

    abstract commit()

    abstract update(updates : Array<FieldUpdate>)

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
}