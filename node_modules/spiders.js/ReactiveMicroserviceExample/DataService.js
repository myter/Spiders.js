Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../src/MicroService/MicroService");
/**
 * Created by flo on 02/08/2017.
 */
var LZString = require("lz-string");
var spider = require("../src/spiders");
class DataService extends MicroService_1.MicroService {
    constructor() {
        super();
        this.thisDirectory = __dirname;
    }
    start() {
        let FleetData = require(this.thisDirectory + "/FleetData").FleetData;
        let DataPacket = require(this.thisDirectory + "/FleetMember").DataPacket;
        this.DB = new Map();
        this.dataSignals = new Map();
        var PORT = 33333;
        var HOST = '127.0.0.1';
        var dgram = require('dgram');
        var server = dgram.createSocket('udp4');
        server.on('listening', function () {
            var address = server.address();
            console.log('UDP Server listening on ' + address.address + ":" + address.port);
        });
        server.on('message', (message, remote) => {
            let dataPacket = JSON.parse(message);
            if (this.dataSignals.has(dataPacket.id)) {
                let signal = this.dataSignals.get(dataPacket.id);
                signal.actualise(dataPacket.lat, dataPacket.lon, dataPacket.speed);
            }
            else {
                let signal = this.newSignal(FleetData, dataPacket.id, dataPacket.lat, dataPacket.lon, dataPacket.speed);
                this.dataSignals.set(dataPacket.id, signal);
                let decompress = (compressedPacket) => {
                    let packet = new DataPacket(compressedPacket.id, compressedPacket.lat, compressedPacket.lon, compressedPacket.speed);
                    packet.decompress();
                    return packet;
                };
                let persist = (packet) => {
                    this.DB.set(dataPacket.id, packet);
                };
                let decompressed = this.lift(decompress)(signal);
                this.publishSignal(decompressed);
                this.lift(persist)(decompressed);
            }
        });
        server.bind(PORT, HOST);
    }
}
exports.DataService = DataService;
//# sourceMappingURL=DataService.js.map