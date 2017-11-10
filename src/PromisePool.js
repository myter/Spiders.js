"use strict";
/**
 * Created by flo on 22/12/2016.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseAllocation = (function () {
    function PromiseAllocation(promise, promiseId) {
        this.promise = promise;
        this.promiseId = promiseId;
    }
    return PromiseAllocation;
}());
exports.PromiseAllocation = PromiseAllocation;
var ForeignPromiseAllocation = (function (_super) {
    __extends(ForeignPromiseAllocation, _super);
    function ForeignPromiseAllocation(promise, promiseId, promiseOwnerId) {
        var _this = _super.call(this, promise, promiseId) || this;
        _this.promiseOwnerId = promiseOwnerId;
        return _this;
    }
    return ForeignPromiseAllocation;
}(PromiseAllocation));
exports.ForeignPromiseAllocation = ForeignPromiseAllocation;
var PromisePool = (function () {
    function PromisePool() {
        this.ids = 0;
        this.promises = new Map();
        this.foreignPromises = new Map();
    }
    PromisePool.prototype.newPromise = function () {
        var res;
        var rej;
        var promId = this.ids;
        var prom = new Promise(function (resolve, reject) {
            res = resolve;
            rej = reject;
        });
        this.promises.set(this.ids, [res, rej]);
        this.ids += 1;
        return new PromiseAllocation(prom, promId);
    };
    PromisePool.prototype.applyForPromise = function (promiseId, arg, funcIndex) {
        if (this.promises.has(promiseId)) {
            this.promises.get(promiseId)[funcIndex](arg);
        }
    };
    PromisePool.prototype.resolvePromise = function (promiseId, value) {
        this.applyForPromise(promiseId, value, 0);
    };
    PromisePool.prototype.rejectPromise = function (promiseId, reason) {
        this.applyForPromise(promiseId, reason, 1);
    };
    PromisePool.prototype.newForeignPromise = function (promiseId, promiseOwnerId) {
        var _this = this;
        var existing = [];
        if (this.foreignPromises.has(promiseOwnerId)) {
            existing = this.foreignPromises.get(promiseOwnerId);
        }
        var prom = new Promise(function (resolve, reject) {
            var alloc = new ForeignPromiseAllocation(prom, promiseId, promiseOwnerId);
            existing.push([alloc, resolve, reject]);
            _this.foreignPromises.set(promiseOwnerId, existing);
        });
        return prom;
    };
    PromisePool.prototype.applyForForeignPromise = function (promiseId, promiseOwnerId, arg, funcIndex) {
        var promises = this.foreignPromises.get(promiseOwnerId);
        promises.forEach(function (alloc) {
            var foreignAlloc = alloc[0];
            if (foreignAlloc.promiseId == promiseId) {
                alloc[funcIndex](arg);
            }
        });
    };
    PromisePool.prototype.resolveForeignPromise = function (promiseId, promiseOwnerId, value) {
        this.applyForForeignPromise(promiseId, promiseOwnerId, value, 1);
    };
    PromisePool.prototype.rejectForeignPromise = function (promiseId, promiseOwnerId, reason) {
        this.applyForForeignPromise(promiseId, promiseOwnerId, reason, 2);
    };
    return PromisePool;
}());
exports.PromisePool = PromisePool;
