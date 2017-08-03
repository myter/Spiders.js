Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
/**
 * Created by flo on 02/08/2017.
 */
class DashboardService extends MicroService_1.MicroService {
    init() {
        let geoTopic = this.newTopic("GeoData");
        let drivingtopic = this.newTopic("DrivingData");
        let updateMap = this.lift((address) => {
            console.log(address);
        });
        let updateDriving = this.lift((score) => {
            console.log(score);
        });
        this.subscribe(geoTopic).each((dataSignal) => {
            updateMap(dataSignal);
        });
        this.subscribe(drivingtopic).each((dataSignal) => {
            updateDriving(dataSignal);
        });
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=DashboardService.js.map