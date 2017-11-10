"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var serialisation_1 = require("../serialisation");
/**
 * Created by flo on 22/03/2017.
 */
var Subscription = (function () {
    function Subscription() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.subArray = [];
        this.listeners = [];
        this.onceMode = false;
        this.discovered = 0;
    }
    Subscription.prototype.newPublishedObject = function (publishedObject) {
        this.discovered++;
        this.subArray.push(publishedObject);
        if (this.onceMode) {
            if (!(this.discovered > 1)) {
                this.listeners.forEach(function (callback) {
                    callback(publishedObject);
                });
            }
        }
        else {
            this.listeners.forEach(function (callback) {
                callback(publishedObject);
            });
        }
    };
    Subscription.prototype.each = function (callback) {
        this.listeners.push(callback);
    };
    Subscription.prototype.all = function () {
        return this.subArray;
    };
    Subscription.prototype.once = function (callback) {
        this.onceMode = true;
        this.listeners.push(callback);
    };
    Subscription.prototype.cancel = function () {
        //TODO
    };
    return Subscription;
}());
exports.Subscription = Subscription;
var Publication = (function () {
    function Publication() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
    }
    Publication.prototype.cancel = function () {
        //TODO, How can server identifiy which publiciation to withdraw ? Far ref equality will probably not work
    };
    return Publication;
}());
exports.Publication = Publication;
var PSClient = (function () {
    function PSClient(serverAddress, serverPort, hostActor) {
        if (serverAddress === void 0) { serverAddress = "127.0.0.1"; }
        if (serverPort === void 0) { serverPort = 8000; }
        this.connected = false;
        this.serverAddress = serverAddress;
        this.serverPort = serverPort;
        var that = this;
        this.bufferedMessages = [];
        hostActor.remote(this.serverAddress, this.serverPort).then(function (serverRef) {
            that.serverRef = serverRef;
            that.connected = true;
            if (that.bufferedMessages.length > 0) {
                that.bufferedMessages.forEach(function (f) {
                    f.apply(that, []);
                });
            }
        });
        this.subscriptions = new Map();
    }
    PSClient.prototype.publish = function (object, typeTag) {
        var _this = this;
        if (this.connected) {
            this.serverRef.addPublish(object, typeTag);
        }
        else {
            this.bufferedMessages.push(function () {
                _this.serverRef.addPublish(object, typeTag);
            });
        }
        //TODO return publication object
    };
    PSClient.prototype.subscribe = function (typeTag) {
        var _this = this;
        if (this.connected) {
            this.serverRef.addSubscriber(typeTag, this);
        }
        else {
            this.bufferedMessages.push(function () {
                _this.serverRef.addSubscriber(typeTag, _this);
            });
        }
        var sub = new Subscription();
        if (!this.subscriptions.has(typeTag.tagVal)) {
            this.subscriptions.set(typeTag.tagVal, []);
        }
        this.subscriptions.get(typeTag.tagVal).push(sub);
        return sub;
    };
    PSClient.prototype.newPublished = function (publishedObject, typeTag) {
        //Sure to have at least one subscription, given that server only invokes this method if this actor is in the TypeTag's subscribers list
        this.subscriptions.get(typeTag.tagVal).forEach(function (sub) {
            sub.newPublishedObject(publishedObject);
        });
    };
    return PSClient;
}());
exports.PSClient = PSClient;
