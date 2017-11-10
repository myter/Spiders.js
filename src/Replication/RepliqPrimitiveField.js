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
 * Created by flo on 16/03/2017.
 */
var PrimitiveFieldUpdate = (function (_super) {
    __extends(PrimitiveFieldUpdate, _super);
    function PrimitiveFieldUpdate(fieldName, initVal, resVal) {
        var _this = _super.call(this, fieldName) || this;
        _this.initVal = initVal;
        _this.resVal = resVal;
        return _this;
    }
    return PrimitiveFieldUpdate;
}(RepliqField_1.FieldUpdate));
exports.PrimitiveFieldUpdate = PrimitiveFieldUpdate;
var RepliqPrimitiveField = (function (_super) {
    __extends(RepliqPrimitiveField, _super);
    function RepliqPrimitiveField(name, value) {
        var _this = _super.call(this, name) || this;
        _this.tentative = value;
        _this.commited = value;
        return _this;
    }
    RepliqPrimitiveField.prototype.read = function () {
        return this.tentative;
    };
    RepliqPrimitiveField.prototype.writeField = function (newValue) {
        this.tentative = newValue;
    };
    RepliqPrimitiveField.prototype.commit = function () {
        this.commited = this.tentative;
        this.triggerCommit();
    };
    RepliqPrimitiveField.prototype.update = function (updates) {
        var _this = this;
        updates.forEach(function (update) {
            _this.tentative = update.resVal;
        });
        this.triggerTentative();
    };
    return RepliqPrimitiveField;
}(RepliqField_1.RepliqField));
exports.RepliqPrimitiveField = RepliqPrimitiveField;
exports.fieldMetaData = new Map();
function makeAnnotation(fieldClass) {
    return function (target, propertyKey) {
        exports.fieldMetaData.set(propertyKey, fieldClass);
    };
}
exports.makeAnnotation = makeAnnotation;
var RepliqCountField = (function (_super) {
    __extends(RepliqCountField, _super);
    function RepliqCountField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RepliqCountField.prototype.update = function (updates) {
        var inc = 0;
        updates.forEach(function (update) {
            inc += (update.resVal - update.initVal);
        });
        this.tentative += inc;
        this.triggerTentative();
    };
    return RepliqCountField;
}(RepliqPrimitiveField));
exports.RepliqCountField = RepliqCountField;
exports.LWR = makeAnnotation(RepliqPrimitiveField);
exports.Count = makeAnnotation(RepliqCountField);
