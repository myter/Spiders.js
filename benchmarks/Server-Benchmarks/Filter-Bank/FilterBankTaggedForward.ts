import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var sourceId = 	null
var nextRef : ClientBufferSocket = 	null
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(si,nextPort){
        sourceId 	= si
        nextRef 	= new ClientBufferSocket(nextPort,mHandle)
        socketToMain.emit(["actorInit"])
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
    }

    function valueMessage(val){
        nextRef.emit(["sourceValueMessage",sourceId,val])
    }

    function exit(){
        nextRef.emit(["exit"])
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2])
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
            console.log("Unknown message (Tagged Forward): " + data[0])
    }
}