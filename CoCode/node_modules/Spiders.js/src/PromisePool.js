/**
 * Created by flo on 22/12/2016.
 */
class PromiseAllocation {
    constructor(promise, promiseId) {
        this.promise = promise;
        this.promiseId = promiseId;
    }
}
exports.PromiseAllocation = PromiseAllocation;
class ForeignPromiseAllocation extends PromiseAllocation {
    constructor(promise, promiseId, promiseOwnerId) {
        super(promise, promiseId);
        this.promiseOwnerId = promiseOwnerId;
    }
}
exports.ForeignPromiseAllocation = ForeignPromiseAllocation;
class PromisePool {
    constructor() {
        this.ids = 0;
        this.promises = new Map();
        this.foreignPromises = new Map();
    }
    newPromise() {
        var res;
        var rej;
        var promId = this.ids;
        var prom = new Promise((resolve, reject) => {
            res = resolve;
            rej = reject;
        });
        this.promises.set(this.ids, [res, rej]);
        this.ids += 1;
        return new PromiseAllocation(prom, promId);
    }
    applyForPromise(promiseId, arg, funcIndex) {
        this.promises.get(promiseId)[funcIndex](arg);
    }
    resolvePromise(promiseId, value) {
        this.applyForPromise(promiseId, value, 0);
    }
    rejectPromise(promiseId, reason) {
        this.applyForPromise(promiseId, reason, 1);
    }
    newForeignPromise(promiseId, promiseOwnerId) {
        var existing = [];
        if (this.foreignPromises.has(promiseOwnerId)) {
            existing = this.foreignPromises.get(promiseOwnerId);
        }
        var prom = new Promise((resolve, reject) => {
            var alloc = new ForeignPromiseAllocation(prom, promiseId, promiseOwnerId);
            existing.push([alloc, resolve, reject]);
            this.foreignPromises.set(promiseOwnerId, existing);
        });
        return prom;
    }
    applyForForeignPromise(promiseId, promiseOwnerId, arg, funcIndex) {
        var promises = this.foreignPromises.get(promiseOwnerId);
        promises.forEach((alloc) => {
            var foreignAlloc = alloc[0];
            if (foreignAlloc.promiseId == promiseId) {
                alloc[funcIndex](arg);
            }
        });
    }
    resolveForeignPromise(promiseId, promiseOwnerId, value) {
        this.applyForForeignPromise(promiseId, promiseOwnerId, value, 1);
    }
    rejectForeignPromise(promiseId, promiseOwnerId, reason) {
        this.applyForForeignPromise(promiseId, promiseOwnerId, reason, 2);
    }
}
exports.PromisePool = PromisePool;
//# sourceMappingURL=PromisePool.js.map