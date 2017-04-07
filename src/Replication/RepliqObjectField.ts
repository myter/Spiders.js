import {RepliqField, FieldUpdate} from "./RepliqField";
/**
 * Created by flo on 30/03/2017.
 */

export class ObjectFieldUpdate extends FieldUpdate{
    fieldName   : string
    methodName  : string
    args        : Array<any>

    constructor(fieldName : string,methodName : string,args : Array<any>){
        super(fieldName)
        this.methodName = methodName
        this.args       = args
    }
}

export class RepliqObjectField extends RepliqField<Object>{
    utils
    read(): Object {
        return this.tentative;
    }

    writeField(newValue: Object) {
        //TODO should not happen, throw exception
    }

    methodInvoked(methodName : string,args : Array<any>){
        this.tentative[methodName](...args)
    }

    commit() {
        this.commited = this.utils.clone(this.tentative)
        this.triggerCommit()
    }

    update(updates: Array<ObjectFieldUpdate>) {
        updates.forEach((update : ObjectFieldUpdate)=>{
            this.methodInvoked(update.methodName,update.args)
        })
        this.triggerTentative()
    }

    constructor(name : string,value : Object){
        super(name)
        this.tentative = value
        this.utils     = require("../utils")
        this.commited  = this.utils.clone(value)
    }

}