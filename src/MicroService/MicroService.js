"use strict";
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
/**
 * Created by flo on 30/06/2017.
 */
var spiders = require("../spiders");
var MicroService = (function (_super) {
    __extends(MicroService, _super);
    function MicroService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MicroService.prototype.init = function () {
        this.PSClient();
    };
    MicroService.prototype.newTopic = function (topicName) {
        return this.newPSTag(topicName);
    };
    MicroService.prototype.publishStrong = function (signalVal, typeTag) {
        if (signalVal.holder.strong) {
            return this.publish(signalVal, typeTag);
        }
        else {
            throw new Error("Cannot publish weak signal as strong for tag: " + typeTag.tagVal);
        }
    };
    MicroService.prototype.publishWeak = function (signalVal, typeTag) {
        //No need to check strong/weakness here signal is either weak and then it's ok, or strong in which case it will be converted to weak signal at receiving side
        signalVal.holder.makeTempWeak();
        return this.publish(signalVal, typeTag);
    };
    MicroService.prototype.subscribeStrong = function (typeTag) {
        var ret = this.subscribe(typeTag);
        ret.each(function (sigVal) {
            if (sigVal.holder.strong) {
                ret.newPublishedObject(sigVal);
            }
            else {
                throw new Error("Cannot strongly subscribe to weak signal for tag: " + typeTag.tagVal);
            }
        });
        return ret;
    };
    MicroService.prototype.subscribeWeak = function (typeTag) {
        var ret = this.subscribe(typeTag);
        ret.each(function (sigVal) {
            sigVal.holder.makeWeak();
            ret.newPublishedObject(sigVal);
        });
        return ret;
    };
    //USED FOR QPROP
    MicroService.prototype.setupInfo = function (graphInfo) {
        this.start(this.QPROP(graphInfo.ownType, graphInfo.directParents, graphInfo.directChildren, graphInfo.initialValue));
    };
    return MicroService;
}(spiders.Actor));
exports.MicroService = MicroService;
//TODO need to refactor this
var MicroServiceApp = (function (_super) {
    __extends(MicroServiceApp, _super);
    function MicroServiceApp() {
        var _this = _super.call(this) || this;
        _this.PSClient();
        return _this;
    }
    MicroServiceApp.prototype.newTopic = function (topicName) {
        return this.newPSTag(topicName);
    };
    MicroServiceApp.prototype.in = function () {
        var typeTags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            typeTags[_i] = arguments[_i];
        }
    };
    MicroServiceApp.prototype.out = function (typeTag, signal) {
    };
    MicroServiceApp.prototype.publishStrong = function (signalVal, typeTag) {
        if (signalVal.holder.strong) {
            return this.publish(signalVal, typeTag);
        }
        else {
            throw new Error("Cannot publish weak signal as strong for tag: " + typeTag.tagVal);
        }
    };
    MicroServiceApp.prototype.publishWeak = function (signalVal, typeTag) {
        //No need to check strong/weakness here signal is either weak and then it's ok, or strong in which case it will be converted to weak signal at receiving side
        signalVal.holder.makeTempWeak();
        return this.publish(signalVal, typeTag);
    };
    MicroServiceApp.prototype.subscribeStrong = function (typeTag) {
        var ret = this.subscribe(typeTag);
        ret.each(function (sigVal) {
            if (sigVal.holder.strong) {
                ret.newPublishedObject(sigVal);
            }
            else {
                throw new Error("Cannot strongly subscribe to weak signal for tag: " + typeTag.tagVal);
            }
        });
        return ret;
    };
    MicroServiceApp.prototype.subscribeWeak = function (typeTag) {
        var ret = this.subscribe(typeTag);
        ret.each(function (sigVal) {
            sigVal.holder.makeWeak();
            ret.newPublishedObject(sigVal);
        });
        return ret;
    };
    return MicroServiceApp;
}(spiders.Application));
exports.MicroServiceApp = MicroServiceApp;
