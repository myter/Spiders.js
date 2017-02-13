import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var sinkRef : ClientBufferSocket = null
var sum =	 0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(sinkPort){
        sinkRef = new ClientBufferSocket(sinkPort,mHandle)
        socketToMain.emit(["actorInit"])
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
    }

    function newVal(val){
        sum += val
    }

    function valEnd(){
        sinkRef.emit(["valueMessage",sum])
        sum = 0
    }

    switch(data[0]){
        case "config":
            config(data[1])
            break;
        case "link":
            link(data[1])
            break;
        case "newVal":
            newVal(data[1])
            break;
        case "valEnd":
            valEnd()
            break;
        default :
            console.log("Unknown message (Combine): " + data[0])
    }
}