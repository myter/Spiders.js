Object.defineProperty(exports, "__esModule", { value: true });
const CAPActor_1 = require("../src/Onward/CAPActor");
const Available_1 = require("../src/Onward/Available");
const Eventual_1 = require("../src/Onward/Eventual");
const Consistent_1 = require("../src/Onward/Consistent");
const spiders_1 = require("../src/spiders");
var scheduled = [];
function log(testName, result, expected) {
    var ul = document.getElementById("resultList");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(testName + ". Expected: " + expected + " . Result : " + result));
    li.setAttribute("id", "element4"); // added line
    if (result == expected) {
        li.style.color = "Green";
    }
    else {
        li.style.color = "Red";
    }
    ul.appendChild(li);
}
var app = new spiders_1.Application();
class TestAvailable extends Available_1.Available {
    constructor() {
        super();
        this.value = 5;
    }
    incWithPrim(num) {
        this.value += num;
    }
    incWithCon(con) {
        this.value += con.value;
    }
}
class TestEventual extends Eventual_1.Eventual {
    constructor() {
        super();
        this.v1 = 5;
    }
    inc() {
        this.v1++;
    }
    incWithPrim(v) {
        this.v1 += v;
    }
    incWithCon(c) {
        this.v1 += c.v1;
    }
}
class TestConsistent extends Consistent_1.Consistent {
    constructor() {
        super();
        this.value = 5;
    }
    incWithPrim(num) {
        this.value += num;
    }
    incWithCon(con) {
        this.value += con.value;
    }
}
class AvailableContentSerActor extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.c = new TestAvailable();
    }
    test() {
        return this.c.value;
    }
}
let AvailableContentSer = () => {
    return app.spawnActor(AvailableContentSerActor).test().then((v) => {
        log("Available Content Serialisation", v, 5);
    });
};
scheduled.push(AvailableContentSer);
class AvailableClassSerActor extends spiders_1.Actor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
    }
    test() {
        let c = new this.TestConsistent();
        return c.value;
    }
}
let AvailableClassSer = () => {
    return app.spawnActor(AvailableClassSerActor).test().then((v) => {
        log("Available Class Serialisation", v, 5);
    });
};
scheduled.push(AvailableClassSer);
class AvailableNOKAssignmentAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
    }
    test() {
        let c = new this.TestConsistent();
        c.value = { x: 5 };
        return c.value;
    }
}
let AvailableNOKAssignment = () => {
    return app.spawnActor(AvailableNOKAssignmentAct).test().catch(() => {
        log("Available NOK Assignment", "N.A.", "N.A.");
    });
};
scheduled.push(AvailableNOKAssignment);
class AvailableNOKConstraintAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
    }
    test() {
        let c = new this.TestConsistent();
        c.incWithCon({ value: 5 });
        return c.value;
    }
}
let AvailableNOKConstraint = () => {
    return app.spawnActor(AvailableNOKConstraintAct).test().catch(() => {
        log("Available NOK Constraint", "N.A.", "N.A.");
    });
};
scheduled.push(AvailableNOKConstraint);
class TestEventualAvailableAssignment extends Eventual_1.Eventual {
    constructor() {
        super();
        this.value = 5;
    }
}
class AvailableAssignmentEventualAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
        this.TestEventual = TestEventualAvailableAssignment;
    }
    test() {
        let c = new this.TestConsistent();
        let cc = new this.TestEventual();
        c.value = cc;
        return c.value;
    }
}
let AvailableAssignmentEventual = () => {
    return app.spawnActor(AvailableAssignmentEventualAct).test().then((v) => {
        log("Available Assignment (Eventual)", v.value, 5);
    });
};
scheduled.push(AvailableAssignmentEventual);
class AvailableAssignmentAvailableAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
    }
    test() {
        let c = new this.TestConsistent();
        let cc = new this.TestConsistent();
        c.value = cc;
        return c.value;
    }
}
let AvailableAssignmentAvailable = () => {
    return app.spawnActor(AvailableAssignmentAvailableAct).test().then((v) => {
        log("Available Assignment (Available)", v.value, 5);
    });
};
scheduled.push(AvailableAssignmentAvailable);
class AvailableAssignmentPrimitiveAct extends spiders_1.Actor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
    }
    test() {
        let c = new this.TestConsistent();
        c.value = 6;
        return c.value;
    }
}
let AvailableAssignmentPrimitive = () => {
    return app.spawnActor(AvailableAssignmentPrimitiveAct).test().then((v) => {
        log("Available Assignment (Primitive)", v, 6);
    });
};
scheduled.push(AvailableAssignmentPrimitive);
class TestEventualAvailableConstraint extends Eventual_1.Eventual {
    constructor() {
        super();
        this.value = 5;
    }
}
class AvailableConstraintEventualAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
        this.TestEventual = TestEventualAvailableConstraint;
    }
    test() {
        let c = new this.TestConsistent();
        let cc = new this.TestEventual();
        c.incWithCon(cc);
        return c.value;
    }
}
let AvailableConstraintEventual = () => {
    return app.spawnActor(AvailableConstraintEventualAct).test().then((v) => {
        log("Available Constraint (Eventual)", v, 10);
    });
};
scheduled.push(AvailableConstraintEventual);
class AvailableConstraintAvailableAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
    }
    test() {
        let c = new this.TestConsistent();
        let cc = new this.TestConsistent();
        c.incWithCon(cc);
        return c.value;
    }
}
let AvailableConstraintAvailable = () => {
    return app.spawnActor(AvailableConstraintAvailableAct).test().then((v) => {
        log("Available Constraint (Available)", v, 10);
    });
};
scheduled.push(AvailableConstraintAvailable);
class AvailableConstraintPrimitiveAct extends spiders_1.Actor {
    constructor() {
        super();
        this.TestConsistent = TestAvailable;
    }
    test() {
        let c = new this.TestConsistent();
        c.incWithPrim(5);
        return c.value;
    }
}
let AvailableConstraintPrimitive = () => {
    return app.spawnActor(AvailableConstraintPrimitiveAct).test().then((v) => {
        log("Available Constraint (Primitive)", v, 10);
    });
};
scheduled.push(AvailableConstraintPrimitive);
class MasterSlaveChangeAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.ev = new TestEventual();
    }
    send(toRef) {
        toRef.getEv(this.ev);
    }
    test() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.ev.v1);
            }, 2000);
        });
    }
}
class SlaveSlaveChangeAct extends CAPActor_1.CAPActor {
    getEv(anEv) {
        anEv.inc();
    }
}
let EventualReplicationSlaveChange = () => {
    let slave = app.spawnActor(SlaveSlaveChangeAct);
    let master = app.spawnActor(MasterSlaveChangeAct);
    master.send(slave);
    return master.test().then((v) => {
        log("Eventual Simple Replication, Slave Change", v, 6);
    });
};
scheduled.push(EventualReplicationSlaveChange);
class MasterMasterChange extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.ev = new TestEventual();
    }
    sendAndInc(toRef) {
        toRef.getEv(this.ev);
        this.ev.inc();
    }
}
class SlaveMasterChange extends CAPActor_1.CAPActor {
    getEv(anEv) {
        this.ev = anEv;
    }
    test() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.ev.v1);
            }, 2000);
        });
    }
}
let EventualReplicationMasterchange = () => {
    let slave = app.spawnActor(SlaveMasterChange);
    let master = app.spawnActor(MasterMasterChange);
    master.sendAndInc(slave);
    return slave.test().then((v) => {
        log("Eventual Simple Replication, Master Change", v, 6);
    });
};
scheduled.push(EventualReplicationMasterchange);
class EventualContentSerialisationAct extends spiders_1.Actor {
    constructor() {
        super();
        this.ev = new TestEventual();
    }
    test() {
        return this.ev.v1;
    }
}
let EventualContentSerialisation = () => {
    return app.spawnActor(EventualContentSerialisationAct).test().then((v) => {
        log("Eventual Content Serialisation", v, 5);
    });
};
scheduled.push(EventualContentSerialisation);
class EventualClassSerialisationAct extends spiders_1.Actor {
    constructor() {
        super();
        this.TestEventual = TestEventual;
    }
    test() {
        let ev = new this.TestEventual();
        return ev.v1;
    }
}
let EventualClassSerialisation = () => {
    return app.spawnActor(EventualClassSerialisationAct).test().then((v) => {
        log("Eventual Class Serialisation", v, 5);
    });
};
scheduled.push(EventualClassSerialisation);
class EventualNOKAssignmentAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestEventual;
    }
    test() {
        let c = new this.TestConsistent();
        c.v1 = { x: 5 };
        return c.value;
    }
}
let EventualNOKAssignment = () => {
    return app.spawnActor(EventualNOKAssignmentAct).test().catch(() => {
        log("Eventual NOK Assignment", "N.A.", "N.A.");
    });
};
scheduled.push(EventualNOKAssignment);
class EventualNOKConstraintAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestEventual;
    }
    test() {
        let c = new this.TestConsistent();
        c.incWithCon({ value: 5 });
        return c.value;
    }
}
let EventualNOKConstraint = () => {
    return app.spawnActor(EventualNOKConstraintAct).test().catch(() => {
        log("Eventual NOK Constraint", "N.A.", "N.A.");
    });
};
scheduled.push(EventualNOKConstraint);
class EventualAssignmentEventualAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestEventual;
    }
    test() {
        let c = new this.TestConsistent();
        let cc = new this.TestConsistent();
        c.v1 = cc;
        return c.v1;
    }
}
let EventualAssignmentEventual = () => {
    return app.spawnActor(EventualAssignmentEventualAct).test().then((v) => {
        log("Eventual Assignment (Eventual)", v.v1, 5);
    });
};
scheduled.push(EventualAssignmentEventual);
class EventualAssignmentPrimitiveAct extends spiders_1.Actor {
    constructor() {
        super();
        this.TestConsistent = TestEventual;
    }
    test() {
        let c = new this.TestConsistent();
        c.v1 = 6;
        return c.v1;
    }
}
let EventualAssignmentPrimitive = () => {
    return app.spawnActor(EventualAssignmentPrimitiveAct).test().then((v) => {
        log("Eventual Assignment (Primitive)", v, 6);
    });
};
scheduled.push(EventualAssignmentPrimitive);
class EventualConstraintEventualAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestEventual;
    }
    test() {
        let c = new this.TestConsistent();
        let cc = new this.TestConsistent();
        c.incWithCon(cc);
        return c.v1;
    }
}
let EventualConstraintEventual = () => {
    return app.spawnActor(EventualConstraintEventualAct).test().then((v) => {
        log("Eventual Constraint (Eventual)", v, 10);
    });
};
scheduled.push(EventualConstraintEventual);
class EventualConstraintPrimitiveAct extends spiders_1.Actor {
    constructor() {
        super();
        this.TestConsistent = TestEventual;
    }
    test() {
        let c = new this.TestConsistent();
        c.incWithPrim(5);
        return c.v1;
    }
}
let EventualConstraintPrimitive = () => {
    return app.spawnActor(EventualConstraintPrimitiveAct).test().then((v) => {
        log("Eventual Constraint (Primitive)", v, 10);
    });
};
scheduled.push(EventualConstraintPrimitive);
class ConsistentContentSerialisationAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.c = new TestConsistent();
    }
    test() {
        return this.c.value;
    }
}
let ConsistentContentSerialisation = () => {
    return app.spawnActor(ConsistentContentSerialisationAct).test().then((v) => {
        log("Consistent Content Serialisation", v, 5);
    });
};
scheduled.push(ConsistentContentSerialisation);
class ConsistentClassSerialisationAct extends spiders_1.Actor {
    constructor() {
        super();
        this.TestConsistent = TestConsistent;
    }
    test() {
        let c = new this.TestConsistent();
        return c.value;
    }
}
let ConsistentClassSerialisation = () => {
    return app.spawnActor(ConsistentClassSerialisationAct).test().then((v) => {
        log("Consistent Class Serialisation", v, 5);
    });
};
scheduled.push(ConsistentClassSerialisation);
class ConsistentNOKAssignmentAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestConsistent;
    }
    test() {
        let c = new this.TestConsistent();
        c.value = { x: 5 };
        return c.value;
    }
}
let ConsistentNOKAssignment = () => {
    return app.spawnActor(ConsistentNOKAssignmentAct).test().catch(() => {
        log("Consistent NOK Assignment", "N.A.", "N.A.");
    });
};
scheduled.push(ConsistentNOKAssignment);
class ConsistentNOKConstraintAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestConsistent;
    }
    test() {
        let c = new this.TestConsistent();
        c.incWithCon({ value: 5 });
        return c.value;
    }
}
let ConsistentNOKConstraint = () => {
    return app.spawnActor(ConsistentNOKConstraintAct).test().catch(() => {
        log("Consistent NOK Constraint", "N.A.", "N.A.");
    });
};
scheduled.push(ConsistentNOKConstraint);
class ConsistentAssignmentConsistentAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestConsistent;
    }
    test() {
        let c = new this.TestConsistent();
        let cc = new this.TestConsistent();
        c.value = cc;
        return c.value;
    }
}
let ConsistentAssignmentConsistent = () => {
    return app.spawnActor(ConsistentAssignmentConsistentAct).test().then((v) => {
        return v.value.then((vv) => {
            log("Consistent Assignment (Consistent)", vv, 5);
        });
    });
};
scheduled.push(ConsistentAssignmentConsistent);
class ConsistentAssignmentPrimitiveAct extends spiders_1.Actor {
    constructor() {
        super();
        this.TestConsistent = TestConsistent;
    }
    test() {
        let c = new this.TestConsistent();
        c.value = 6;
        return c.value;
    }
}
let ConsistentAssignmentPrimitive = () => {
    return app.spawnActor(ConsistentAssignmentPrimitiveAct).test().then((v) => {
        log("Consistent Assignment (Primitive)", v, 6);
    });
};
scheduled.push(ConsistentAssignmentPrimitive);
class ConsistentConstraintConsistentAct extends CAPActor_1.CAPActor {
    constructor() {
        super();
        this.TestConsistent = TestConsistent;
    }
    test() {
        let c = new this.TestConsistent();
        let cc = new this.TestConsistent();
        c.incWithCon(cc);
        return c.value;
    }
}
let ConsistentConstraintConsistent = () => {
    return app.spawnActor(ConsistentConstraintConsistentAct).test().then((v) => {
        log("Consistent Constraint (Consistent)", v, 10);
    });
};
scheduled.push(ConsistentConstraintConsistent);
class ConsistentConstraintPrimitiveAct extends spiders_1.Actor {
    constructor() {
        super();
        this.TestConsistent = TestConsistent;
    }
    test() {
        let c = new this.TestConsistent();
        c.incWithPrim(5);
        return c.value;
    }
}
let ConsistentConstraintPrimitive = () => {
    return app.spawnActor(ConsistentConstraintPrimitiveAct).test().then((v) => {
        log("Consistent Constraint (Primitive)", v, 10);
    });
};
scheduled.push(ConsistentConstraintPrimitive);
function performAll(nextTest) {
    nextTest().then(() => {
        if (scheduled.length > 0) {
            performAll(scheduled.pop());
        }
    });
}
performAll(scheduled.pop());
//# sourceMappingURL=testCapExtension.js.map