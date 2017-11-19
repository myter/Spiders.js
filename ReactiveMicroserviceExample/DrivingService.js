Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
/**
 * Created by flo on 02/08/2017.
 */
class DrivingService extends MicroService_1.MicroService {
    start(inputSignals) {
        let exp = this.lift(([fleetData, addressData]) => {
            console.log("Driving service updating");
            return "ok";
        })(inputSignals);
        this.publishSignal(exp);
    }
    speedViolation() {
        return new Promise((resolve, reject) => {
            resolve(false);
        });
    }
}
exports.DrivingService = DrivingService;
//# sourceMappingURL=DrivingService.js.map