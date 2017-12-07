Object.defineProperty(exports, "__esModule", { value: true });
//Simulates actual vehicles with beacons which communicate to data service over UDP
var LZString = require("lz-string");
var spiders = require("../src/spiders");
class DataPacket extends spiders.Isolate {
    constructor(id, lat, lon, speed) {
        super();
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.speed = speed;
    }
    compress() {
        this.id = LZString.compress((JSON.stringify(this.id)));
        this.lat = LZString.compress((JSON.stringify(this.lat)));
        this.lon = LZString.compress((JSON.stringify(this.lon)));
        this.speed = LZString.compress((JSON.stringify(this.speed)));
    }
    decompress() {
        this.id = LZString.decompress(this.id);
        this.lat = LZString.decompress(this.lat);
        this.lon = LZString.decompress(this.lon);
        this.speed = LZString.decompress(this.speed);
    }
}
exports.DataPacket = DataPacket;
class FleetMember {
    constructor() {
        this.serverPort = 33333;
        this.serverAddress = '127.0.0.1';
        var dgram = require('dgram');
        this.LZString = require("lz-string");
        this.clientSocket = dgram.createSocket('udp4');
    }
    sendData(id, lat, long, speed) {
        let packet = new DataPacket(id, lat, long, speed);
        packet.compress();
        let message = new Buffer(JSON.stringify(packet));
        this.clientSocket.send(message, 0, message.length, this.serverPort, this.serverAddress);
    }
}
exports.FleetMember = FleetMember;
//# sourceMappingURL=FleetMember.js.map