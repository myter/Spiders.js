"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var spiders = require('../src/spiders');
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        _super.apply(this, arguments);
    }
    return App;
}(spiders.Application));
var Act = (function (_super) {
    __extends(Act, _super);
    function Act() {
        _super.apply(this, arguments);
    }
    return Act;
}(spiders.Actor));
