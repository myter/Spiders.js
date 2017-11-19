var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
/**
 * Created by flo on 02/08/2017.
 */
var spiders = require("../src/spiders");
class AddressSignal extends spiders.Signal {
    constructor(aData) {
        super();
        this.aData = aData;
    }
    update(newA) {
        this.aData = newA;
    }
}
__decorate([
    spiders.mutator
], AddressSignal.prototype, "update", null);
class GeoService extends MicroService_1.MicroService {
    constructor() {
        super();
        this.AddressSignal = AddressSignal;
    }
    start(fleetDataSignal) {
        //Reverse geo-code (async so return promise)
        let exp = this.lift(([fleetData]) => {
            /*let sig : any = this.newSignal(this.AddressSignal)
            this.reverseGeoCode(fleetData.lat,fleetData.lon).then((address)=>{
                sig.update(address)
            })
            return sig*/
            console.log("Geo service updating");
            return "ok";
        })(fleetDataSignal);
        this.publishSignal(exp);
    }
    reverseGeoCode(lat, lon) {
        return new Promise((resolve, reject) => {
            resolve("benchmark mode");
        });
    }
}
exports.GeoService = GeoService;
//# sourceMappingURL=GeoService.js.map