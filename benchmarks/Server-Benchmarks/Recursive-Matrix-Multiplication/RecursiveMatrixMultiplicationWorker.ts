import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 13/02/2017.
 */
var threshold = 	null
var dataLength = null
var id = 		null
var masterRef : ClientBufferSocket = 	null
var A = 			{}
var B =			{}
var C =			{}
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(i,thresh,dl,masterPort){
        threshold	= thresh
        masterRef 	= new ClientBufferSocket(masterPort,mHandle)
        id 		= i
        dataLength = dl
        for(var j = 0;j < dataLength;j++){
            A[j] = {}
            B[j] = {}
            C[j] = {}
            for(var k = 0;k < dataLength;k++){
                A[j][k] = k
                B[j][k] = k
                C[j][k] = 0
            }
        }
        socketToMain.emit(["actorInit"])
    }

    function work(priority,srA,scA,srB,scB,srC,scC,numBlocks,dim){
        var newPriority = priority + 1
        if(numBlocks > threshold){
            var zerDim 			= 0
            var newDim 			= dim / 2
            var newNumBlocks 	= numBlocks / 4
            masterRef.emit(["sendWork",newPriority,srA + zerDim,scA + zerDim,srB + zerDim,scB + zerDim,srC + zerDim,scC + zerDim,newNumBlocks,newDim])
            masterRef.emit(["sendWork",newPriority,srA + zerDim,scA + newDim,srB + newDim,scB + zerDim,srC + zerDim,scC + zerDim,newNumBlocks,newDim])
            masterRef.emit(["sendWork",newPriority,srA + zerDim,scA + zerDim,srB + zerDim,scB + newDim,srC + zerDim,scC + newDim,newNumBlocks,newDim])
            masterRef.emit(["sendWork",newPriority,srA + zerDim,scA + newDim,srB + newDim,scB + newDim,srC + zerDim,scC + newDim,newNumBlocks,newDim])
            masterRef.emit(["sendWork",newPriority,srA + newDim,scA + zerDim,srB + zerDim,scB + zerDim,srC + newDim,scC + zerDim,newNumBlocks,newDim])
            masterRef.emit(["sendWork",newPriority,srA + newDim,scA + newDim,srB + newDim,scB + zerDim,srC + newDim,scC + zerDim,newNumBlocks,newDim])
            masterRef.emit(["sendWork",newPriority,srA + newDim,scA + zerDim,srB + zerDim,scB + newDim,srC + newDim,scC + newDim,newNumBlocks,newDim])
            masterRef.emit(["sendWork",newPriority,srA + newDim,scA + newDim,srB + newDim,scB + newDim,srC + newDim,scC + newDim,newNumBlocks,newDim])
        }
        else{
            var endR = srC + dim
            var endC = scC + dim
            var i = srC
            while(i < endR){
                var j = scC
                while(j < endC){
                    var k = 0
                    while(k < dim){
                        C[i][j] += A[i][scA + k] * B[srB + k][j]
                        k += 1
                    }
                    j += 1
                }
                i += 1
            }
        }
        masterRef.emit(["done"])
    }

    function stop(){
        masterRef.emit(["stop"])
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3],data[4])
            break;
        case "work":
            work(data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9])
            break;
        case "stop":
            stop()
            break;
        default :
            console.log("Unknown message (Worker): " + data[0])
    }
}