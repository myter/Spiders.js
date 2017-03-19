/**
 * Created by flo on 08/01/2017.
 */
class ObjectPool {
    constructor(behaviourObject = null) {
        this.currentId = 1;
        this.pool = new Map();
        this.pool.set(ObjectPool._BEH_OBJ_ID, behaviourObject);
    }
    installBehaviourObject(behaviourObject) {
        this.pool.set(ObjectPool._BEH_OBJ_ID, behaviourObject);
    }
    allocateObject(obj) {
        var objectId = this.currentId;
        this.pool.set(objectId, obj);
        this.currentId += 1;
        return objectId;
    }
    getObject(objectId) {
        return this.pool.get(objectId);
    }
}
ObjectPool._BEH_OBJ_ID = 0;
exports.ObjectPool = ObjectPool;
//# sourceMappingURL=objectPool.js.map