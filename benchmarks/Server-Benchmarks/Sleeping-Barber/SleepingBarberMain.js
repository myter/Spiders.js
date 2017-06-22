Object.defineProperty(exports, "__esModule", { value: true });
const benchUtils_1 = require("../../benchUtils");
/**
 * Created by flo on 08/02/2017.
 */
class NodeSleepingBarberBench extends benchUtils_1.SpiderBenchmark {
    constructor() {
        super("Node Sleeping Barber", "Node Sleeping Barber cycle completed", "Node Sleeping Barber completed", "Node Sleeping Barber scheduled");
        this.lastPort = 8004;
        this.customers = [];
    }
    runBenchmark() {
        var actorsInitialised = 0;
        var that = this;
        function sysHandle(data) {
            function checkConfig() {
                if (actorsInitialised == benchUtils_1.BenchConfig.barberNrHaircuts + 3) {
                    that.customerFactoryRef.emit(["start"]);
                }
            }
            function actorInit() {
                actorsInitialised += 1;
                checkConfig();
            }
            function end() {
                that.stopPromise.resolve();
            }
            switch (data[0]) {
                case "actorInit":
                    actorInit();
                    break;
                case "end":
                    end();
                    break;
                default:
                    console.log("Unknown message: " + data[0]);
            }
        }
        that.mainSocket = new benchUtils_1.ServerBufferSocket(benchUtils_1.SpiderBenchmark._MAIN_PORT_, sysHandle);
        that.barberRef = that.spawnNode("Sleeping-Barber/SleepingBarberBarber", sysHandle, NodeSleepingBarberBench._BARBER_PORT_);
        that.barberRef.emit(["config", benchUtils_1.BenchConfig.barberHaircut]);
        that.waitingRoomRef = that.spawnNode("Sleeping-Barber/SleepingBarberWaitingRoom", sysHandle, NodeSleepingBarberBench._WAITING_PORT_);
        that.waitingRoomRef.emit(["config", benchUtils_1.BenchConfig.barberWaitingRoom, NodeSleepingBarberBench._BARBER_PORT_]);
        that.barberRef.emit(["linkRoom", NodeSleepingBarberBench._WAITING_PORT_]);
        that.customerFactoryRef = that.spawnNode("Sleeping-Barber/SleepingBarberCustomerFactory", sysHandle, NodeSleepingBarberBench._CUSTOMER_PORT_);
        that.waitingRoomRef.emit(["link", NodeSleepingBarberBench._CUSTOMER_PORT_]);
        that.customerFactoryRef.emit(["config", benchUtils_1.BenchConfig.barberNrHaircuts, benchUtils_1.BenchConfig.barberProduction, NodeSleepingBarberBench._WAITING_PORT_]);
        var custCount = benchUtils_1.BenchConfig.barberNrHaircuts - 1;
        while (custCount >= 0) {
            var newCust = that.spawnNode("Sleeping-Barber/SleepingBarberCustomer", sysHandle, that.lastPort);
            newCust.emit(["config", NodeSleepingBarberBench._CUSTOMER_PORT_]);
            that.customerFactoryRef.emit(["newCustomer", that.lastPort]);
            that.customers.push(newCust);
            that.lastPort++;
            custCount -= 1;
        }
    }
    cleanUp() {
        this.cleanNodes();
        this.mainSocket.close();
        this.customers = [];
    }
}
NodeSleepingBarberBench._BARBER_PORT_ = 8001;
NodeSleepingBarberBench._WAITING_PORT_ = 8002;
NodeSleepingBarberBench._CUSTOMER_PORT_ = 8003;
exports.NodeSleepingBarberBench = NodeSleepingBarberBench;
//# sourceMappingURL=SleepingBarberMain.js.map