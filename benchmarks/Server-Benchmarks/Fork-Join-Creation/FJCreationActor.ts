import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 07/02/2017.
 */
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)
function mHandler(data){
    function calc(theta){
        var sint 	= Math.sin(theta)
        var res 	= sint * sint
    }

    function newMessage(){
        calc(37.2)
        socketToMain.emit(["actorDone"])
    }

    switch(data[0]){
        case "newMessage":
            newMessage()
            break;
    }
}
socketToMain.emit(["actorInit"])