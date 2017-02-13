import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var sourceId = 		null
var delayLength = 	null
var nextRef : ClientBufferSocket = 		null
var state = 			[]
var placeHolder = 	0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(si,dl,nextPort){
        sourceId 		= si
        delayLength 	= dl
        nextRef 		= new ClientBufferSocket(nextPort,mHandle)
        for(var i = 0;i < delayLength;i++){
            state[i] = 0
        }
        socketToMain.emit(["actorInit"])
    }

    function link(ref){
        ref.onmessage = mHandle
    }

    function valueMessage(val){
        nextRef.emit(["valueMessage",state[placeHolder]])
        state[placeHolder] = val
        placeHolder = (placeHolder + 1) %  delayLength
    }

    function exit(){
        nextRef.emit(["exit"])
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3])
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
            console.log("Unknown message (Delay): " + data[0])
    }
}