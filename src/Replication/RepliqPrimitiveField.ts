
import {FieldUpdate, RepliqField} from "./RepliqField";
/**
 * Created by flo on 16/03/2017.
 */
export class PrimitiveFieldUpdate extends FieldUpdate{
    initVal
    resVal

    constructor(fieldName,initVal,resVal){
        super(fieldName)
        this.initVal    = initVal
        this.resVal     = resVal
    }
}

export class RepliqPrimitiveField<T> extends RepliqField<T>{

    read() : T{
        return this.tentative
    }

    writeField(newValue : T){
        this.tentative = newValue
    }

    commit(){
        this.commited = this.tentative
        this.triggerCommit()
    }

    update(updates : Array<PrimitiveFieldUpdate>){
        updates.forEach((update : PrimitiveFieldUpdate)=>{
            this.tentative = update.resVal
        })
        this.triggerTentative()
    }


    constructor(name : string,value : T){
        super(name)
        this.tentative          = value
        this.commited           = value
    }
}

export var fieldMetaData = new Map()
export function makeAnnotation(fieldClass) : any{
    return function(target,propertyKey){
        fieldMetaData.set(propertyKey,fieldClass)
    }
}

export class RepliqCountField extends RepliqPrimitiveField<number>{
    update(updates : Array<FieldUpdate>){
        let inc = 0
        updates.forEach((update : PrimitiveFieldUpdate)=>{
            inc += (update.resVal - update.initVal)
        })
        this.tentative += inc
        this.triggerTentative()
    }

}

export var LWR      = makeAnnotation(RepliqPrimitiveField)
export var Count    = makeAnnotation(RepliqCountField)