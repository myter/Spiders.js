import {SpiderLib} from "../../../src/spiders";
import {SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 30/01/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")

class ChameneoActor extends spiders.Actor{
    meetingsHeld    = 0
    color           = null

    config(color) {
        this.color = color
        this.parent.actorInit()
    }

    startGame() {
        this.parent.meet(this, this.color)
    }

    exitGame() {
        this.color = -1
        this.parent.meetCount(this.meetingsHeld)
    }

    meet(sender,otherColor) {
        this.color = this.complement(otherColor)
        this.meetingsHeld += 1
        sender.changeColor(this.color)
        this.parent.meet(this, this.color)
    }

    changeColor(color) {
        this.color = color
        this.meetingsHeld += 1
        this.parent.meet(this, this.color)
    }

    //Doesn't make a lot of sense, but doesn't really matter for benchmark anyway
    complement(otherColor) {
        switch (this.color) {
            case -1:
                return -1;
            case 0:
                switch (otherColor) {
                    case 1:
                        return 2;
                    case 2:
                        return 1;
                    case 0:
                        return 0;
                    case -1:
                        return -1;
                }
                ;
            case 1:
                switch (otherColor) {
                    case 1:
                        return 1;
                    case 2:
                        return 0;
                    case 0:
                        return 2;
                    case -1:
                        return -1;
                }
            case 2:
                switch (otherColor) {
                    case 1:
                        return 0;
                    case 2:
                        return 2;
                    case 0:
                        return 1;
                    case -1:
                        return -1;
                }

        }
    }
}

class ChameneoApp extends spiders.Application{
    actorsInitialised   = 0
    meetingsToHold      = BenchConfig.chameneoMeetings
    numFaded            = 0
    sumMeetings         = 0
    waitingCham         = null
    actors              = []
    bench

    constructor(bench : SpiderBenchmark){
        super()
        this.bench = bench
    }

    setup(){
        var count = BenchConfig.chameneoActors
        while(count > 0){
            var newActor = this.spawnActor(ChameneoActor)
            this.actors.push(newActor)
            count -= 1
        }
        //Faded color = -1
        //blue = 0
        //red = 1
        //yellow = 2
        for(var i = 0;i < this.actors.length;i++){
            var next = this.actors[i]
            next.config(i % 3)
        }
    }

    checkConfig() {
        if (this.actorsInitialised == BenchConfig.chameneoActors) {
            for (var i in this.actors) {
                this.actors[i].startGame()
            }
        }
    }

    actorInit() {
        this.actorsInitialised += 1
        this.checkConfig()
    }

    meetCount(count) {
        this.numFaded += 1
        this.sumMeetings = this.sumMeetings + count
        if (this.numFaded == BenchConfig.chameneoActors) {
            this.bench.stopPromise.resolve()
        }
    }

    meet(sender,color) {
        if (this.meetingsToHold > 0) {
            if (this.waitingCham == null) {
                this.waitingCham = sender
            }
            else {
                this.meetingsToHold -= 1
                this.waitingCham.meet(sender, color)
                this.waitingCham = null
            }
        }
        else {
            sender.exitGame()
        }
    }
}

export class SpiderChameneoBench extends SpiderBenchmark{
    chameneoApp
    constructor(){
        super("Spiders.js Chameneo","Spiders.js Chameneo cycle completed","Spiders.js Chameneo completed","Spiders.js Chameneo scheduled")
    }

    runBenchmark(){
        this.chameneoApp = new ChameneoApp(this)
        this.chameneoApp.setup()
    }

    cleanUp(){
        this.chameneoApp.kill()
        this.chameneoApp.actors = []
    }
}