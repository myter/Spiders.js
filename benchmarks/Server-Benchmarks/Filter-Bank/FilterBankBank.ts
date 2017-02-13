import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var id = 			null
var totalColumns = 	null
var integrateRef : ClientBufferSocket =	null
var firstRef : ClientBufferSocket =		null
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(i,tc,integratePort){
        id 			= i
        totalColumns 	= tc
        integrateRef 	= new ClientBufferSocket(integratePort,mHandle)
        socketToMain.emit(["actorInit"])
    }

    function linkFirst(firstPort){
        firstRef = new ClientBufferSocket(firstPort,mHandle)
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
    }

    function valueMessage(val){
        firstRef.emit(["valueMessage",val])
    }

    function exit(){
        firstRef.emit(["exit"])
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3])
            break;
        case "linkFirst":
            linkFirst(data[1])
            break;
        case "link":
            link(data[1])
            break;
        case "valueMessage":
            valueMessage(data[1])
            break;
        case "exit":
            exit()
            break;
        default :
            console.log("Unknown message (Bank): " + data[0])
    }
}