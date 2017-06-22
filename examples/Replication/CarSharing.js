Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 04/04/2017.
 */
var spiders = require("../../src/spiders");
var pubSub = require("../../src/PubSub/PubSub");
var server = new pubSub.PubSubServer();
class Platform extends pubSub.PubSubClient {
    constructor() {
        super();
        this.directory = __dirname;
    }
    init() {
        let reps = require(this.directory + '/CarSharingReps');
        let master = this.newRepliq(reps.PlatformRepliq);
        this.publish(master, reps.PlatformTag);
    }
}
class Customer extends pubSub.PubSubClient {
    constructor() {
        super();
        this.directory = __dirname;
    }
    init() {
        let reps = require(this.directory + '/CarSharingReps');
        //TODO , implement ONCE instead of each
        this.subscribe(reps.PlatformTag).each((platformReplica) => {
            console.log("Got replica");
        });
    }
}
server.spawnActor(Platform);
server.spawnActor(Customer);
server.spawnActor(Customer);
//# sourceMappingURL=CarSharing.js.map