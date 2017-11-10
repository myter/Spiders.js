"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signal_1 = require("./signal");
var messages_1 = require("../messages");
var serialisation_1 = require("../serialisation");
var NoGlitchFreedom = (function () {
    function NoGlitchFreedom() {
    }
    NoGlitchFreedom.prototype.setSignalPool = function (signalPool) {
        this.signalPool = signalPool;
    };
    NoGlitchFreedom.prototype.propagationReceived = function (fromId, signalId, value) {
        //Could be that the signal was garbage collected (shouldn't happen given the failure model)
        if (this.signalPool.knownSignal(signalId)) {
            //Elm style propagation, signal pool serves as event dispatcher
            this.signalPool.sources.forEach(function (sourceSignal, id) {
                if (id == signalId) {
                    sourceSignal.clock++;
                    sourceSignal.change(value);
                }
                else {
                    sourceSignal.change(signal_1.Signal.NO_CHANGE);
                }
            });
        }
    };
    NoGlitchFreedom.prototype.propagate = function (signal, toIds) {
        var _this = this;
        toIds.forEach(function (toId) {
            _this.signalPool.environment.commMedium.sendMessage(toId, new messages_1.ExternalSignalChangeMessage(_this.signalPool.environment.thisRef, signal.id, serialisation_1.serialise(signal.value, toId, _this.signalPool.environment)));
        });
    };
    return NoGlitchFreedom;
}());
exports.NoGlitchFreedom = NoGlitchFreedom;
