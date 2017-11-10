"use strict";
/**
 * Created by flo on 30/03/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var FieldUpdate = (function () {
    function FieldUpdate(fieldName) {
        this.fieldName = fieldName;
    }
    return FieldUpdate;
}());
exports.FieldUpdate = FieldUpdate;
var RepliqField = (function () {
    function RepliqField(name) {
        this.commitListeners = [];
        this.tentativeListeners = [];
        this.name = name;
    }
    RepliqField.prototype.resetToCommit = function () {
        this.tentative = this.commited;
    };
    RepliqField.prototype.onCommit = function (callback) {
        this.commitListeners.push(callback);
    };
    RepliqField.prototype.triggerCommit = function () {
        var _this = this;
        this.commitListeners.forEach(function (callback) {
            callback(_this.commited);
        });
    };
    RepliqField.prototype.onTentative = function (callback) {
        this.tentativeListeners.push(callback);
    };
    RepliqField.prototype.triggerTentative = function () {
        var _this = this;
        this.tentativeListeners.forEach(function (callback) {
            callback(_this.tentative);
        });
    };
    return RepliqField;
}());
exports.RepliqField = RepliqField;
