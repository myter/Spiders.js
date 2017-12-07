Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
/**
 * Created by flo on 02/08/2017.
 */
class DashboardService extends MicroService_1.MicroService {
    start(inputSignals) {
        this.lift(([drivingData, geoData, configData]) => {
            drivingData.then((violation) => {
                geoData.then((address) => {
                    if (!configData) {
                        console.log("Driving: " + violation + " geo: " + address.address);
                    }
                    else if (configData.type == "short") {
                        console.log("Driving: " + violation + " geo: " + address.address);
                    }
                    else {
                        console.log("Dashboard updated to: " + violation + " geographical poistion: " + address.address);
                    }
                });
            });
        })(inputSignals);
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=DashboardService.js.map