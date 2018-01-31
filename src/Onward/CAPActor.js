Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../spiders");
class CAPMirror extends spiders.SpiderActorMirror {
    getEventualArgs(args) {
        return args.filter((arg, index) => {
            if (arg) {
                //No this isn't some dumb mistake, must ensure that it is true and not a true-like value!
                return arg.isEventual == true;
            }
            else {
                return false;
            }
        });
    }
    receiveInvocation(sender, targetObject, methodName, args, performInvocation = () => { }) {
        let eventualArgs = this.getEventualArgs(args);
        let gsp = this.base.behaviourObject.gsp;
        if (eventualArgs.length > 0) {
            sender.gsp.then((senderGSPRef) => {
                eventualArgs.forEach((eventual) => {
                    eventual.setHost(gsp, this.base.thisRef.ownerId, false);
                    gsp.registerHolderEventual(eventual, senderGSPRef);
                });
                super.receiveInvocation(sender, targetObject, methodName, args, performInvocation);
            });
        }
        else {
            super.receiveInvocation(sender, targetObject, methodName, args, performInvocation);
        }
    }
    sendInvocation(target, methodName, args, contactId = this.base.thisRef.ownerId, contactAddress = null, contactPort = null, mainId = null) {
        let eventualArgs = this.getEventualArgs(args);
        let gsp = this.base.behaviourObject.gsp;
        eventualArgs.forEach((eventual) => {
            //An eventual is being sent to another actor, without that eventual being already registered
            //In other words, this eventual must have been created newly by the sending actor
            if (!gsp.knownEventual(eventual.id)) {
                if (eventual.committedVals.size == 0) {
                    //This is the first invocation on this eventual, populate its committed map
                    eventual.populateCommitted();
                }
                gsp.registerMasterEventual(eventual);
                eventual.setHost(gsp, this.base.thisRef.ownerId, true);
            }
        });
        return super.sendInvocation(target, methodName, args, contactId, contactAddress, contactPort, mainId);
    }
}
exports.CAPMirror = CAPMirror;
class CAPActor extends spiders.Actor {
    constructor() {
        super(new CAPMirror());
        this.GSP = require("./GSP").GSP;
        this.Round = require("./Round").Round;
    }
    init() {
        this.gsp = new this.GSP(this.reflectOnActor().base.thisRef.ownerId, this.Round);
    }
}
exports.CAPActor = CAPActor;
//# sourceMappingURL=CAPActor.js.map