import {MicroService} from "../src/MicroService/MicroService";
import {DataPacket} from "./FleetMember";
import {SpiderLib} from "../src/spiders";
import {FleetData} from "./FleetData";
/**
 * Created by flo on 02/08/2017.
 */
var LZString                = require("lz-string")
var spider : SpiderLib      = require("../src/spiders")

interface CompressedPacket{
    id:     string
    lat:    string
    lon:    string
    speed:  string
}

export class DataService extends MicroService{
    thisDirectory
    dataSignals : Map<string,FleetData>
    DataPacket
    DB

    constructor(){
        super()
        this.thisDirectory  = __dirname
    }

    start(){
        let FleetData       = require(this.thisDirectory + "/FleetData").FleetData
        let DataPacket      = require(this.thisDirectory + "/FleetMember").DataPacket
        this.DB             = new Map()
        this.dataSignals    = new Map()
        var PORT            = 33333;
        var HOST            = '127.0.0.1';
        var dgram           = require('dgram');
        var server          = dgram.createSocket('udp4');
        server.on('listening', function () {
            var address = server.address();
            console.log('UDP Server listening on ' + address.address + ":" + address.port);
        });
        server.on('message', (message, remote)=> {
            let dataPacket: CompressedPacket = JSON.parse(message)
            if(this.dataSignals.has(dataPacket.id)){
                let signal : FleetData = this.dataSignals.get(dataPacket.id)
                signal.actualise(dataPacket.lat,dataPacket.lon,dataPacket.speed)
            }
            else{
                let signal = this.newSignal(FleetData,dataPacket.id,dataPacket.lat,dataPacket.lon,dataPacket.speed)
                this.dataSignals.set(dataPacket.id,signal as any)
                let decompress = (compressedPacket : CompressedPacket) => {
                    let packet = new DataPacket(compressedPacket.id,compressedPacket.lat,compressedPacket.lon,compressedPacket.speed)
                    packet.decompress()
                    return packet
                }
                let persist = (packet : DataPacket) => {
                    this.DB.set(dataPacket.id,packet)
                }
                let decompressed = this.lift(decompress)(signal)
                this.publishSignal(decompressed)
                this.lift(persist)(decompressed)
            }
        });
        server.bind(PORT, HOST);
    }
}