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
var RepliqField_1 = require("./RepliqField");
/**
 * Created by flo on 30/03/2017.
 */
var ObjectFieldUpdate = (function (_super) {
    __extends(ObjectFieldUpdate, _super);
    function ObjectFieldUpdate(fieldName, methodName, args) {
        var _this = _super.call(this, fieldName) || this;
        _this.methodName = methodName;
        _this.args = args;
        return _this;
    }
    return ObjectFieldUpdate;
}(RepliqField_1.FieldUpdate));
exports.ObjectFieldUpdate = ObjectFieldUpdate;
var RepliqObjectField = (function (_super) {
    __extends(RepliqObjectField, _super);
    function RepliqObjectField(name, value) {
        var _this = _super.call(this, name) || this;
        _this.tentative = value;
        _this.utils = require("../utils");
        _this.commited = _this.utils.clone(value);
        return _this;
    }
    RepliqObjectField.prototype.read = function () {
        return this.tentative;
    };
    RepliqObjectField.prototype.writeField = function (newValue) {
        //TODO should not happen, throw exception
    };
    RepliqObjectField.prototype.methodInvoked = function (methodName, args) {
        (_a = this.tentative)[methodName].apply(_a, args);
        var _a;
    };
    RepliqObjectField.prototype.commit = function () {
        this.commited = this.utils.clone(this.tentative);
        this.triggerCommit();
    };
    RepliqObjectField.prototype.update = function (updates) {
        var _this = this;
        updates.forEach(function (update) {
            _this.methodInvoked(update.methodName, update.args);
        });
        this.triggerTentative();
    };
    return RepliqObjectField;
}(RepliqField_1.RepliqField));
exports.RepliqObjectField = RepliqObjectField;
