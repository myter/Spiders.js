"use strict";
/**
 * Created by flo on 08/01/2017.
 */
var ObjectPool = (function () {
    function ObjectPool(behaviourObject) {
        if (behaviourObject === void 0) { behaviourObject = null; }
        this.currentId = 1;
        this.pool = new Map();
        this.pool.set(ObjectPool._BEH_OBJ_ID, behaviourObject);
    }
    ObjectPool.prototype.installBehaviourObject = function (behaviourObject) {
        this.pool.set(ObjectPool._BEH_OBJ_ID, behaviourObject);
    };
    ObjectPool.prototype.allocateObject = function (obj) {
        var objectId = this.currentId;
        this.pool.set(objectId, obj);
        this.currentId += 1;
        return objectId;
    };
    ObjectPool.prototype.getObject = function (objectId) {
        return this.pool.get(objectId);
    };
    ObjectPool._BEH_OBJ_ID = 0;
    return ObjectPool;
}());
exports.ObjectPool = ObjectPool;
