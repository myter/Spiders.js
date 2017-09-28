Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
/**
 * Created by flo on 02/08/2017.
 */
class ParsingService extends MicroService_1.MicroService {
    init() {
        let inTopic = this.newTopic("FleetData");
        let outTopic = this.newTopic("ParsedData");
        let deserialise = this.lift((fleetData) => {
            return JSON.parse(fleetData);
        });
        let persist = this.lift((fleetData) => {
            //Store in DB
        });
        let fail = this.liftFailure((fleetData) => {
            console.log("Failure detected");
        });
        this.subscribe(inTopic).each((dataSignal) => {
            let deserialised = deserialise(dataSignal);
            fail(deserialised);
            persist(deserialised);
            this.publish(deserialised, outTopic);
        });
    }
}
exports.ParsingService = ParsingService;
//# sourceMappingURL=ParsingService.js.map