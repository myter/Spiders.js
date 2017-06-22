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
    }
    newSignal(signal) {
        this.signals.set(signal.id, signal);
    }
    registerExternalListener(signalId, holderId) {
        let signal = this.signals.get(signalId);
        signal.registerListener(() => {
            this.commMedium.sendMessage(holderId, new messages_1.ExternalSignalChangeMessage(this.thisRef, signal.id, signal.currentVal));
        });
    }
    getSignal(signalId) {
        return this.signals.get(signalId);
    }
}
exports.SignalPool = SignalPool;
//# sourceMappingURL=signalPool.js.map