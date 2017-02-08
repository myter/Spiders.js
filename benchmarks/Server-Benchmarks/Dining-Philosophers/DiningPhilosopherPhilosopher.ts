import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var waiterRef : ClientBufferSocket  = null
var id          = null
var totalRounds = null
var doneRounds  = 0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){

    function config(i,tr,waiterPort){
        id 		= i
        totalRounds = tr
        waiterRef = new ClientBufferSocket(waiterPort,mHandle)
        socketToMain.emit(["actorInit"])
    }

    function start(){
        waiterRef.emit(["hungry",id,myPort])
    }

    function denied(){
        waiterRef.emit(["hungry",id,myPort])
    }

    function eating(){
        doneRounds += 1
        waiterRef.emit(["done",id])
        if(doneRounds == totalRounds){
            waiterRef.emit(["philExit"])
        }
        else{
            waiterRef.emit(["hungry",id,myPort])
        }
    }
    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3])
            break;
        case "start":
            start()
            break;
        case "denied":
            denied()
            break;
        case "eating":
            eating()
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}