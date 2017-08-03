Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
/**
 * Created by flo on 02/08/2017.
 */
class GeoService extends MicroService_1.MicroService {
    init() {
        let inTopic = this.newTopic("ParsedData");
        let outTopic = this.newTopic("GeoData");
        let reverseGeoCode = this.lift((fleetData) => {
            //Just return string containing latitude and longitude
            return fleetData[0].toString() + " , " + fleetData[1].toString();
        });
        this.subscribe(inTopic).each((dataSignal) => {
            let address = reverseGeoCode(dataSignal);
            this.publish(address, outTopic);
        });
    }
}
exports.GeoService = GeoService;
//# sourceMappingURL=GeoService.js.map