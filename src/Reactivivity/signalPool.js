Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../messages");
/**
 * Created by flo on 22/06/2017.
 */
class SignalPool {
    constructor(commMedium, thisRef) {
        this.commMedium = commMedium;
        this.thisRef = thisRef;
        this.signals = new Map();
        this.sources = new Map();
    }
    newSource(signal) {
        this.sources.set(signal.id, signal);
    }
    newSignal(signal) {
        this.signals.set(signal.id, signal);
    }
    registerExternalListener(signalId, holderId) {
        let signal;
        if (this.signals.has(signalId)) {
            signal = this.signals.get(signalId);
        }
        else if (this.sources.has(signalId)) {
            signal = this.sources.get(signalId);
        }
        else {
            throw new Error("Unable to find signal to register listener");
        }
        signal.registerListener(() => {
            this.commMedium.sendMessage(holderId, new messages_1.ExternalSignalChangeMessage(this.thisRef, signal.id, signal.currentVal));
        });
    }
    sourceChanged(signalId, val) {
        //Elm style propagation, signal pool serves as event dispatcher
        this.sources.forEach((sourceSignal, id) => {
            if (id == signalId) {
                sourceSignal.change(val);
            }
            else {
                sourceSignal.change(sourceSignal.currentVal);
            }
        });
    }
}
exports.SignalPool = SignalPool;
//# sourceMappingURL=signalPool.js.map