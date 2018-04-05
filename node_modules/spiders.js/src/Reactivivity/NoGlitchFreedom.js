Object.defineProperty(exports, "__esModule", { value: true });
const signal_1 = require("./signal");
const Message_1 = require("../Message");
const serialisation_1 = require("../serialisation");
class NoGlitchFreedom {
    setSignalPool(signalPool) {
        this.signalPool = signalPool;
    }
    propagationReceived(fromId, signalId, value) {
        //Could be that the signal was garbage collected (shouldn't happen given the failure model)
        if (this.signalPool.knownSignal(signalId)) {
            //Elm style propagation, signal pool serves as event dispatcher
            this.signalPool.sources.forEach((sourceSignal, id) => {
                if (id == signalId) {
                    sourceSignal.clock++;
                    sourceSignal.change(value);
                }
                else {
                    sourceSignal.change(signal_1.Signal.NO_CHANGE);
                }
            });
        }
    }
    propagate(signal, toIds) {
        toIds.forEach((toId) => {
            this.signalPool.environment.commMedium.sendMessage(toId, new Message_1.ExternalSignalChangeMessage(this.signalPool.environment.thisRef, signal.id, serialisation_1.serialise(signal.value, toId, this.signalPool.environment)));
        });
    }
}
exports.NoGlitchFreedom = NoGlitchFreedom;
//# sourceMappingURL=NoGlitchFreedom.js.map