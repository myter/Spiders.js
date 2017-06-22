var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 20/03/2017.
 */
var spider = require("../../src/spiders");
//Extend the default "last writer wins" field to create a "log" field which checks the diff between two logs
class LogField extends spider.RepliqField {
    update(updates) {
        updates.forEach((update) => {
            let diffIndex = update.initVal.length;
            this.tentative += update.resVal.substring(diffIndex, update.resVal.length);
        });
    }
}
//Create a "Log" annotation which allows programmers to tag fields of a Repliq as log fields
var Log = spider.makeAnnotation(LogField);
class TestRepliq extends spider.Repliq {
    constructor() {
        super();
        //Provide initial values for all fields
        this.register = 1;
        this.counter = 1;
        this.log = "";
    }
    //Using @atomic ensures that all updates performed by the method are sent as a transaction to the master
    updateAll(regVal, logAppend) {
        this.register = regVal;
        this.counter += 1;
        this.log += logAppend;
    }
}
__decorate([
    spider.LWR
], TestRepliq.prototype, "register", void 0);
__decorate([
    spider.Count
], TestRepliq.prototype, "counter", void 0);
__decorate([
    Log
], TestRepliq.prototype, "log", void 0);
__decorate([
    spider.atomic
], TestRepliq.prototype, "updateAll", null);
var app = new spider.Application();
class MyActor extends spider.Actor {
    //Method which gets a replica from the amster
    getReplica(replica) {
        this.myReplica = replica;
        //Set a listener which is triggered each time the counter field has a new tentative value
        this.myReplica.counter.onTentative((val) => {
            console.log("Replica version of counter has new tentative value: " + val);
        });
    }
    performUpdate(regVal) {
        //Set a listener which is triggered as soon the updates of the method are confirmed and commited by the master
        this.myReplica.updateAll(regVal, "aLog").onceCommited(() => {
            console.log("Updates have been commited by master");
        });
    }
}
//Create a master replica (all actors have a "newRepliq" method which creates a repliq given a repliq class definition)
var masterReplica = app.newRepliq(TestRepliq);
//Set a listener which is triggered each time the master's register field has a new commited value
masterReplica.register.onCommit((val) => {
    console.log("Master version of register has new commited value: " + val);
});
//Spawn an actor, provide it with a replica of the master and instruct it to perform an update
var actor1 = app.spawnActor(MyActor);
actor1.getReplica(masterReplica);
actor1.performUpdate(10);
//# sourceMappingURL=Replication.js.map