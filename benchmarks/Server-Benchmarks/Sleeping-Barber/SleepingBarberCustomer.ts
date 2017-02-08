import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var factoryRef : ClientBufferSocket = null
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(factoryPort){
        factoryRef = new ClientBufferSocket(factoryPort,mHandle)
        socketToMain.emit(["actorInit"])
    }

    function roomFull(){
        factoryRef.emit(["returned",myPort])
    }

    function done(){
        factoryRef.emit(["done"])
    }

    switch(data[0]){
        case "config":
            config(data[1])
            break;
        case "roomFull":
            roomFull()
            break;
        case "done":
            done()
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}