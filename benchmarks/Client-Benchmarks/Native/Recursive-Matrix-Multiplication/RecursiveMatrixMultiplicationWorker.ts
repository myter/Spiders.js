/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var threshold = 	null
    var dataLength = null
    var id = 		null
    var masterRef = 	null
    var A = 			{}
    var B =			{}
    var C =			{}

    function mHandle(event){
        function config(master,i,thresh,dl){
            threshold	= thresh
            masterRef 	= master
            masterRef.onmessage = mHandle
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
            self.postMessage(["actorInit"])
        }

        function work(priority,srA,scA,srB,scB,srC,scC,numBlocks,dim){
            var newPriority = priority + 1
            if(numBlocks > threshold){
                var zerDim 			= 0
                var newDim 			= dim / 2
                var newNumBlocks 	= numBlocks / 4
                masterRef.postMessage(["sendWork",newPriority,srA + zerDim,scA + zerDim,srB + zerDim,scB + zerDim,srC + zerDim,scC + zerDim,newNumBlocks,newDim])
                masterRef.postMessage(["sendWork",newPriority,srA + zerDim,scA + newDim,srB + newDim,scB + zerDim,srC + zerDim,scC + zerDim,newNumBlocks,newDim])
                masterRef.postMessage(["sendWork",newPriority,srA + zerDim,scA + zerDim,srB + zerDim,scB + newDim,srC + zerDim,scC + newDim,newNumBlocks,newDim])
                masterRef.postMessage(["sendWork",newPriority,srA + zerDim,scA + newDim,srB + newDim,scB + newDim,srC + zerDim,scC + newDim,newNumBlocks,newDim])
                masterRef.postMessage(["sendWork",newPriority,srA + newDim,scA + zerDim,srB + zerDim,scB + zerDim,srC + newDim,scC + zerDim,newNumBlocks,newDim])
                masterRef.postMessage(["sendWork",newPriority,srA + newDim,scA + newDim,srB + newDim,scB + zerDim,srC + newDim,scC + zerDim,newNumBlocks,newDim])
                masterRef.postMessage(["sendWork",newPriority,srA + newDim,scA + zerDim,srB + zerDim,scB + newDim,srC + newDim,scC + newDim,newNumBlocks,newDim])
                masterRef.postMessage(["sendWork",newPriority,srA + newDim,scA + newDim,srB + newDim,scB + newDim,srC + newDim,scC + newDim,newNumBlocks,newDim])
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
            masterRef.postMessage(["done"])
        }

        function stop(){
            masterRef.postMessage(["stop"])
        }

        switch(event.data[0]){
            case "config":
                config(event.ports[0],event.data[1],event.data[2],event.data[3])
                break;
            case "work":
                work(event.data[1],event.data[2],event.data[3],event.data[4],event.data[5],event.data[6],event.data[7],event.data[8],event.data[9])
                break;
            case "stop":
                stop()
                break;
            default :
                console.log("Unknown message (Worker): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}