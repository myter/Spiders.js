/**
 * Created by flo on 08/01/2017.
 */
export class ObjectPool{
    static _BEH_OBJ_ID  = 0
    private currentId   = 1
    private pool        = new Map()

    constructor(behaviourObject : Object = null){
        this.pool.set(ObjectPool._BEH_OBJ_ID,behaviourObject)
    }

    installBehaviourObject(behaviourObject : Object){
        this.pool.set(ObjectPool._BEH_OBJ_ID,behaviourObject)
    }

    allocateObject(obj : Object) : number {
        var objectId = this.currentId
        this.pool.set(objectId,obj)
        this.currentId += 1
        return objectId
    }

    getObject(objectId : number) : Object {
        return this.pool.get(objectId)
    }
}