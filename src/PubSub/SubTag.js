"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var serialisation_1 = require("../serialisation");
/**
 * Created by flo on 22/03/2017.
 */
var spiders = require("../spiders");
var PubSubTag = (function () {
    function PubSubTag(tagVal) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.tagVal = tagVal;
    }
    PubSubTag.prototype.equals = function (otherTag) {
        otherTag.tagVal == this.tagVal;
    };
    PubSubTag.prototype.asString = function () {
        return this.tagVal;
    };
    return PubSubTag;
}());
exports.PubSubTag = PubSubTag;
