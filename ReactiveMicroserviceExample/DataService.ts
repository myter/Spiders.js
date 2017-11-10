import {MicroService} from "../src/MicroService/MicroService";
/**
 * Created by flo on 02/08/2017.
 */


export class DataService extends MicroService{
    thisDirectory
    LZString
    constructor(){
        super()
        this.thisDirectory = __dirname
        this.LZString = require("lz-string")
    }

    start(){
        let FleetData = require(this.thisDirectory + "/FleetData").FleetData
        var PORT = 33333;
        var HOST = '127.0.0.1';
        var dgram = require('dgram');
        var server = dgram.createSocket('udp4');
        /*server.on('listening', function () {
            var address = server.address();
            console.log('UDP Server listening on ' + address.address + ":" + address.port);
        });*/
        server.on('message', (message, remote)=> {
            console.log("Original message:" + message)
            //TODO decompress signal should return the fleet data object with decompressed fields
            let decompressed = require("lz-string").decompress(message.toString())
            //let decompressed = this.LZString.decompress(message)
            //console.log("Server got: " + JSON.parse(decompressed))
        });
        server.bind(PORT, HOST);
    }
}