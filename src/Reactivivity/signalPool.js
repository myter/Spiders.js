Object.defineProperty(exports, "__esModule", { value: true });
const signal_1 = require("./signal");
const messages_1 = require("../messages");
const serialisation_1 = require("../serialisation");
/**
 * Created by flo on 22/06/2017.
 */
class SignalPool {
    constructor(commMedium, thisRef, promisePool, objectPool) {
        this.commMedium = commMedium;
        this.thisRef = thisRef;
        this.signals = new Map();
        this.sources = new Map();
    }
    newSource(signal) {
        this.sources.set(signal.id, signal);
        if (signal.rateLowerBound < Infinity) {
            this.trackLease(signal.id, signal.rateLowerBound);
        }
    }
    knownSignal(signalId) {
        return this.sources.has(signalId);
    }
    trackLease(signalId, bound) {
        let valBeforeTimeout = this.sources.get(signalId).value;
        setTimeout(() => {
            let valAfterTimeout = this.sources.get(signalId).value;
            if (valAfterTimeout == valBeforeTimeout) {
                //console.log("Lease should be destroyed yo ! in: " + this.thisRef.ownerId)
            }
            else {
                //console.log("Lease still ok in: " + this.thisRef.ownerId)
                this.trackLease(signalId, bound);
            }
        }, bound);
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
            this.commMedium.sendMessage(holderId, new messages_1.ExternalSignalChangeMessage(this.thisRef, signal.id, serialisation_1.serialise(signal.value, this.thisRef, holderId, this.commMedium, this.promisePool, this.objectPool)));
        });
    }
    sourceChanged(signalId, val) {
        //Elm style propagation, signal pool serves as event dispatcher
        this.sources.forEach((sourceSignal, id) => {
            if (id == signalId) {
                sourceSignal.change(val);
            }
            else {
                sourceSignal.change(signal_1.Signal.NO_CHANGE);
            }
        });
    }
}
exports.SignalPool = SignalPool;
//# sourceMappingURL=signalPool.js.map