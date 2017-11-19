import {SpiderLib} from "../../src/spiders";
import {MicroServiceApp} from "../../src/MicroService/MicroService";
import {PubSubTag} from "../../src/PubSub/SubTag";

var spiders : SpiderLib = require("../../src/spiders")
var dataTag             = new PubSubTag("Data")
var geoTag              = new PubSubTag("Geo")
var drivingTag          = new PubSubTag("Driving")
var dashTag             = new PubSubTag("Dash")
var admitterTag        = new PubSubTag("Admitter")
/*class Tags extends spiders.Isolate{
    dataTag
    geoTag
    drivingTag
    dashTag

    constructor(){
        super()
        this.dataTag    = dataTag
        this.geoTag     = geoTag
        this.drivingTag = drivingTag
        this.dashTag    = dashTag
    }
}
var allTags             = new Tags()*/

class FleetData extends spiders.Signal{
    constructionTime

    constructor(){
        super()
        this.constructionTime = Date.now()
    }

    @spiders.mutator
    actualise(){
        this.constructionTime = Date.now()
    }
}

export class Admitter extends MicroServiceApp{
    constructor(){
        super("127.0.0.1",8005)
        this.SIDUPAdmitter(admitterTag,1,1)
    }
}

export class DataAccessService extends MicroServiceApp{
    rate
    constructor(rate,isQPROP){
        super("127.0.0.1",8001)
        this.rate = rate
        if(isQPROP){
            this.QPROP(dataTag,[],[geoTag,drivingTag],null)
        }
        else{
            this.SIDUP(dataTag,[],admitterTag)
        }
        let sig = this.newSignal(FleetData)

        this.publishSignal(sig)
        this.update(sig)
    }

    update(signal){
        signal.actualise()
        setTimeout(()=>{
            this.update(signal)
        },this.rate)
    }
}

export class GeoService extends MicroServiceApp{
    constructor(isQPROP){
        super("127.0.0.1",8002)
        let imp
        if(isQPROP){
            imp = this.QPROP(geoTag,[dataTag],[drivingTag,dashTag],null)
        }
        else{
           imp = this.SIDUP(geoTag,[dataTag],admitterTag)
        }
        let exp = this.lift(([fleetData])=>{
            return fleetData
        })(imp)
        this.publishSignal(exp)
    }
}

export class DrivingService extends MicroServiceApp{
    constructor(isQPROP){
        super("127.0.0.1",8003)
        let imp
        if(isQPROP){
            imp = this.QPROP(drivingTag,[dataTag,geoTag],[dashTag],null)
        }
        else{
            imp = this.SIDUP(drivingTag,[dataTag,geoTag],admitterTag)
        }
        let exp = this.lift(([data,geo])=>{
            return data
        })(imp)
        this.publishSignal(exp)
    }
}

export class DashboardService extends MicroServiceApp{
    constructor(isQPROP){
        super("127.0.0.1",8004)
        let imp
        if(isQPROP){
            imp = this.QPROP(dashTag,[drivingTag,geoTag],[],null)
        }
        else{
            imp = this.SIDUP(dashTag,[drivingTag,geoTag],admitterTag,true)
        }
        let exp = this.lift(([driving,geo])=>{
            console.log("Dash updated, date: " + driving.constructionTime)
        })(imp)
    }
}