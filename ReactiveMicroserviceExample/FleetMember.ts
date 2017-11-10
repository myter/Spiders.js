/**
 * Created by flo on 02/08/2017.
 */

//Simulates actual vehicles with beacons which communicate to data service over UDP
export class FleetMember{
    clientSocket
    LZString
    serverPort
    serverAddress

    constructor(){
        this.serverPort = 33333;
        this.serverAddress = '127.0.0.1';
        var dgram = require('dgram');
        this.LZString = require("lz-string")
        this.clientSocket = dgram.createSocket('udp4');
    }

    sendData(id,lat,long,speed){
        let packet = {id: id,lat: lat,long: long,speed: speed}
        //TODO only compress the fields, not the object itself
        let message = new Buffer(this.LZString.compress(JSON.stringify(packet)))
        this.clientSocket.send(message, 0, message.length, this.serverPort, this.serverAddress);
    }
}