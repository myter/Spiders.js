import {SpiderLib} from "../../src/spiders";
/**
 * Created by flo on 20/03/2017.
 */
var spider : SpiderLib = require("../../src/spiders")

//Extend the default "last writer wins" field to create a "log" field which checks the diff between two logs
class LogField extends spider.RepliqField{
    update(updates){
        updates.forEach((update)=>{
            let diffIndex = update.initVal.length
            this.tentative += update.resVal.substring(diffIndex,update.resVal.length)
        })
    }
}

//Create a "Log" annotation which allows programmers to tag fields of a Repliq as log fields
var Log = spider.makeAnnotation(LogField)

class TestRepliq extends spider.Repliq{
    //Tag the "register" value to be a "last writer wins" field (default)
    @spider.LWR
    register
    //Tag the counter field to be a "count" field (i.e. increment value on each update)
    @spider.Count
    counter
    //Custom log field explained above
    @Log
    log

    constructor(){
        super()
        //Provide initial values for all fields
        this.register = 1
        this.counter  = 1
        this.log      = ""
    }

    //Using @atomic ensures that all updates performed by the method are sent as a transaction to the master
    @spider.atomic
    updateAll(regVal,logAppend){
        this.register = regVal
        this.counter += 1
        this.log     += logAppend
    }
}
var app = new spider.Application()

class MyActor extends spider.Actor{
    myReplica

    //Method which gets a replica from the amster
    getReplica(replica){
        this.myReplica = replica
        //Set a listener which is triggered each time the counter field has a new tentative value
        this.myReplica.counter.onTentative((val)=>{
            console.log("Replica version of counter has new tentative value: " + val)
        })
    }

    performUpdate(regVal){
        //Set a listener which is triggered as soon the updates of the method are confirmed and commited by the master
        this.myReplica.updateAll(regVal,"aLog").onceCommited(()=>{
            console.log("Updates have been commited by master")
        })
    }
}

//Create a master replica (all actors have a "newRepliq" method which creates a repliq given a repliq class definition)
var masterReplica : any  = app.newRepliq(TestRepliq)
//Set a listener which is triggered each time the master's register field has a new commited value
masterReplica.register.onCommit((val)=>{
    console.log("Master version of register has new commited value: " + val)
})
//Spawn an actor, provide it with a replica of the master and instruct it to perform an update
var actor1          = app.spawnActor(MyActor)
actor1.getReplica(masterReplica)
actor1.performUpdate(10)