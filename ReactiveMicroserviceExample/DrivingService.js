Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
/**
 * Created by flo on 02/08/2017.
 */
class DrivingService extends MicroService_1.MicroService {
    init() {
        let inTopic = this.newTopic("ParsedData");
        let outTopic = this.newTopic("DrivingData");
        let drivingScore = this.lift((fleetData) => {
            let rand = Math.random();
            //generate fictive driving score
            if (fleetData[2] % 2 == 0) {
                return "good";
            }
            else {
                return "bad";
            }
        });
        this.subscribe(inTopic).each((dataSignal) => {
            let score = drivingScore(dataSignal);
            this.publish(score, outTopic);
        });
    }
}
exports.DrivingService = DrivingService;
//# sourceMappingURL=DrivingService.js.map