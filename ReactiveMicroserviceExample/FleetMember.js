Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
const FleetData_1 = require("./FleetData");
/**
 * Created by flo on 02/08/2017.
 */
class FleetMember extends MicroService_1.MicroService {
    getRandom() {
        return Math.floor((Math.random() * 100) + 1);
    }
    init() {
        this.myId = this.getRandom();
        this.curLat = this.getRandom();
        this.curLong = this.getRandom();
        this.curSpeed = this.getRandom();
        this.dataSignal = this.newSignal(FleetData_1.FleetData, this.myId, this.curLat, this.curLong, this.curSpeed);
        let serialise = this.lift((fleetData) => {
            //Actual fleet data object is circular (which JSON can't handle)
            return JSON.stringify([fleetData.currentLat, fleetData.currentLong, fleetData.currentSpeed, fleetData.memberId]);
        });
        let compressed = serialise(this.dataSignal);
        let topic = this.newTopic("FleetData");
        this.publish(compressed, topic);
        this.update();
    }
    update() {
        let newLat = this.getRandom();
        let newLong = this.getRandom();
        let newSpeed = this.getRandom();
        this.dataSignal.actualise(newLat, newLong, newSpeed);
        setTimeout(() => {
            this.update();
        }, 3000);
    }
}
exports.FleetMember = FleetMember;
//# sourceMappingURL=FleetMember.js.map