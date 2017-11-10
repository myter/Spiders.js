"use strict";
/*

Queue.js

A function to represent a queue

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/
Object.defineProperty(exports, "__esModule", { value: true });
var Queue = (function () {
    function Queue() {
        this.queue = [];
        this.offset = 0;
    }
    Queue.prototype.getLength = function () {
        return (this.queue.length - this.offset);
    };
    Queue.prototype.isEmpty = function () {
        return this.getLength() == 0;
    };
    Queue.prototype.enQueue = function (item) {
        this.queue.push(item);
    };
    Queue.prototype.deQueue = function () {
        // if the queue is empty, return immediately
        if (this.queue.length == 0)
            return undefined;
        // store the item at the front of the queue
        var item = this.queue[this.offset];
        // increment the offset and remove the free space if necessary
        if (++this.offset * 2 >= this.queue.length) {
            this.queue = this.queue.slice(this.offset);
            this.offset = 0;
        }
        // return the dequeued item
        return item;
    };
    Queue.prototype.peek = function () {
        return this.queue.length > 0 ? this.queue[this.offset] : undefined;
    };
    Queue.prototype.peekAll = function (callback) {
        var _this = this;
        this.queue.forEach(function (el, index) {
            if (index > _this.offset) {
                callback(el);
            }
        });
    };
    Queue.prototype.contains = function (comp) {
        var _this = this;
        var has = false;
        this.queue.forEach(function (el, index) {
            if (index > _this.offset && comp(el)) {
                has = true;
            }
        });
        return has;
    };
    Queue.prototype.remove = function (comp) {
        var _this = this;
        var newValues = [];
        var newOffset = 0;
        this.queue.forEach(function (el, index) {
            if (index > _this.offset && comp(el)) {
                newValues.push(el);
            }
        });
        this.queue = newValues;
        this.offset = newOffset;
    };
    return Queue;
}());
exports.Queue = Queue;
