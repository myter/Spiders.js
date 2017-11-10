/*

Queue.js

A function to represent a queue

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/
Object.defineProperty(exports, "__esModule", { value: true });
class Queue {
    constructor() {
        this.queue = [];
        this.offset = 0;
    }
    getLength() {
        return (this.queue.length - this.offset);
    }
    isEmpty() {
        return this.getLength() == 0;
    }
    enQueue(item) {
        this.queue.push(item);
    }
    deQueue() {
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
    }
    peek() {
        return this.queue.length > 0 ? this.queue[this.offset] : undefined;
    }
    peekAll(callback) {
        this.queue.forEach((el, index) => {
            if (index > this.offset) {
                callback(el);
            }
        });
    }
    contains(comp) {
        let has = false;
        this.queue.forEach((el, index) => {
            if (index > this.offset && comp(el)) {
                has = true;
            }
        });
        return has;
    }
    remove(comp) {
        let newValues = [];
        let newOffset = 0;
        this.queue.forEach((el, index) => {
            if (index > this.offset && comp(el)) {
                newValues.push(el);
            }
        });
        this.queue = newValues;
        this.offset = newOffset;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map