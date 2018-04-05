Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
const ExampleConfig_1 = require("./ExampleConfig");
/**
 * Created by flo on 02/08/2017.
 */
class DrivingService extends MicroService_1.MicroService {
    constructor() {
        super();
        this.API_KEY = ExampleConfig_1.API_KEY;
    }
    start(inputSignals) {
        let exp = this.lift(([fleetData, addressData]) => {
            return addressData.then((addressObject) => {
                let place = addressObject.place;
                return this.speedViolation(place, fleetData.speed);
            });
        })(inputSignals);
        this.publishSignal(exp);
    }
    speedViolation(place, currentspeed) {
        var request = require('request-promise-native');
        return request("https://roads.googleapis.com/v1/speedLimits?placeId=" + place + "&key=" + this.API_KEY).then((response) => {
            let maxSpeed = response.speedLimits[0].speedLimit;
            return currentspeed > maxSpeed;
        })
            .catch((reason) => {
            console.log(reason);
        });
    }
}
exports.DrivingService = DrivingService;
//# sourceMappingURL=DrivingService.js.map