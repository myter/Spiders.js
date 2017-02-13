import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var sourceId = 	null
var peekLength = null
var coef = 		[]
var nextRef : ClientBufferSocket = 	null
var data =		[]
var dataIndex = 	0
var dataFull = 	false
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(si,pl,nextPort){
        sourceId 	= si
        peekLength = pl
        nextRef 	= new ClientBufferSocket(nextPort,mHandle)
        for(var i = 0;i < peekLength;i++){
            data[i] = 0
        }
    }

    function newCoef(c){
        coef.push(c)
    }

    function configDone(){
        socketToMain.emit(["actorInit"])
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
    }

    function valueMessage(val){
        data[dataIndex] = val
        dataIndex += 1
        if(dataIndex == peekLength){
            dataFull = true
            dataIndex = 0
        }
        if(dataFull){
            var sum = 0.0
            var i 	= 0
            while(i < peekLength){
                sum += data[i] * coef[peekLength - i - 1]
                i   += 1
            }
            nextRef.emit(["valueMessage",sum])
        }
    }

    function exit(){
        nextRef.emit(["exit"])
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3])
            break;
        case "newCoef":
            newCoef(data[1])
            break;
        case "configDone":
            configDone()
            break;
        case "valueMessage":
            valueMessage(data[1])
            break;
        case "link":
            link(data[1])
            break;
        case "exit":
            exit()
            break;
        default :
            console.log("Unknown message (Fir Filter): " + data[0])
    }
}