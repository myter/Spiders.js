import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var totalChannels = 	null
var combineRef : ClientBufferSocket = 	null
var data =			{}
var dataIndex = 		0
var exitsReceived = 	0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(tc,combinePort){
        totalChannels 	= tc
        combineRef 	= new ClientBufferSocket(combinePort,mHandle)
        socketToMain.emit(["actorInit"])
    }

    function removeEntry(key){
        var copy = {}
        for(var i in data){
            if(!(i == key)){
                copy[key] = data[key]
            }
        }
        data = copy
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
    }

    function sourceValueMessage(sourceId,val){
        var dataSize = 0
        for(var i in data){
            dataSize += 1
        }
        var processed = false
        var j = 0
        while(j < dataSize){
            var loopMap = data[j]
            if(!(sourceId in loopMap)){
                loopMap[sourceId] = val
                processed = true
                j = dataSize
            }
            j += 1
        }
        if(!processed){
            var newMap = {}
            newMap[sourceId] = val
            data[dataIndex] = newMap
            dataIndex += 1
        }
        var firstMap = data[0]
        var firstMapSize = 0
        for(var i in firstMap){
            firstMapSize += 1
        }
        if(firstMapSize == totalChannels){
            for(var i in firstMap){
                combineRef.emit(["newVal",firstMap[i]])
            }
            combineRef.emit(["valEnd"])
            removeEntry(0)
        }
    }

    function exit(){
        exitsReceived += 1
        if(exitsReceived == totalChannels){
            socketToMain.emit(["end"])
        }
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2])
            break;
        case "link":
            link(data[1])
            break;
        case "sourceValueMessage":
            sourceValueMessage(data[1],data[2])
            break;
        case "exit":
            exit()
            break;
        default :
            console.log("Unknown message (Integrator): " + data[0])
    }
}