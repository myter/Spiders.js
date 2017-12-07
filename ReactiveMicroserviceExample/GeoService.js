var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
const ExampleConfig_1 = require("./ExampleConfig");
/**
 * Created by flo on 02/08/2017.
 */
var spiders = require("../src/spiders");
var geocoder = require('geocoder');
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
class AddressData extends spiders.Isolate {
    constructor(address, place) {
        super();
        this.address = address;
        this.place = place;
    }
}
exports.AddressData = AddressData;
class GeoService extends MicroService_1.MicroService {
    constructor() {
        super();
        this.AddressSignal = AddressSignal;
        this.AddressData = AddressData;
        this.API_KEY = ExampleConfig_1.API_KEY;
    }
    start(fleetDataSignal) {
        //Reverse geo-code (async so return promise)
        let exp = this.lift(([fleetData]) => {
            return this.reverseGeoCode(fleetData.lat, fleetData.lon);
        })(fleetDataSignal);
        this.publishSignal(exp);
    }
    reverseGeoCode(lat, lon) {
        var geocoder = require('geocoder');
        var that = this;
        return new Promise((resolve) => {
            geocoder.reverseGeocode(lat, lon, function (err, data) {
                if (err) {
                    console.log(err);
                }
                resolve(new that.AddressData(data.results[0].formatted_address, data.results[0].place_id));
            }, { key: this.API_KEY });
        });
    }
}
exports.GeoService = GeoService;
//# sourceMappingURL=GeoService.js.map