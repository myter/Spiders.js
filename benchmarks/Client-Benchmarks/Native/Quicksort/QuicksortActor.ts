/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var dataSize = 		null
    var maxVal = 		null
    var threshold = 	null
    var parentRef = 	null
    var position = 		null
    var data =			[]
    var result = 		[]
    var numFragments = 	0

    function mHandle(event){
        function config(hasParent,ds,mv,thresh,parent,pos){
            if(hasParent){
                parentRef 	= parent
                parentRef.onmessage = mHandle
            }
            dataSize 		= ds
            maxVal 		= mv
            threshold 		= thresh
            position 		= pos
        }

        function newData(dataPoint){
            data.push(dataPoint)
        }

        function configDone(){
            self.postMessage(["actorInit"])
        }

        function sequentialSort(dataCopy){
            var dataLength 		= dataCopy.length
            if(dataLength < 2){
                return dataCopy
            }
            else{
                var pivot 			= dataCopy[dataLength / 2]
                var leftUnsorted 	= filterLessThan(dataCopy,pivot)
                var leftSorted 		= sequentialSort(leftUnsorted)
                var equalElements 	= filterEqualsTo(dataCopy,pivot)
                var rightUnsorted 	= filterGreaterThan(dataCopy,pivot)
                var rightSorted 	= sequentialSort(rightUnsorted)
                var sorted 			= []
                for(var i in rightUnsorted){
                    sorted.push(rightUnsorted[i])
                }
                for(var i in equalElements){
                    sorted.push(equalElements[i])
                }
                for(var i in leftUnsorted){
                    sorted.push(leftUnsorted[i])
                }
                return sorted
            }
        }

        function notifyParentAndTerminate(){
            if(parentRef != null){
                parentRef.postMessage(["gotResult",result,position])
            }
            else{
                self.postMessage(["end"])
            }
        }

        function filterLessThan(dataCopy,pivot){
            var dataLength 	= dataCopy.length
            var result 		= []
            for(var i in dataCopy){
                if(dataCopy[i] < pivot){
                    result.push(dataCopy[i])
                }
            }
            return result
        }

        function filterGreaterThan(dataCopy,pivot){
            var dataLength 	= dataCopy.length
            var result 		= []
            for(var i in dataCopy){
                if(dataCopy[i] > pivot){
                    result.push(dataCopy[i])
                }
            }
            return result
        }

        function filterEqualsTo(dataCopy,pivot){
            var dataLength 	= dataCopy.length
            var result 		= []
            for(var i in dataCopy){
                if(dataCopy[i] == pivot){
                    result.push(dataCopy[i])
                }
            }
            return result
        }

        function sort(){
            var dataLength = data.length
            var dataLengthHalf 	= Math.floor(dataLengthHalf / 2)
            var pivot 			= data[dataLengthHalf]
            if(dataLength < threshold){
                sequentialSort(data)
                notifyParentAndTerminate()
            }
            else{
                var c1 = new MessageChannel()
                c1.port2.onmessage = mHandle
                self.postMessage(["spawnNew","LEFT"],[c1.port1])
                var c2 = new MessageChannel()
                c2.port2.onmessage = mHandle
                self.postMessage(["spawnNew","RIGHT"],[c2.port1])
                result = filterEqualsTo(data,pivot)
                numFragments += 1
            }
        }

        function childSpawned(ref,position){
            ref.onmessage = mHandle
            var dataLengthHalf 	= Math.floor(data.length / 2)
            var pivot 			= data[dataLengthHalf]
            var leftUnsorted 	= filterLessThan(data,pivot)
            var rightUnsorted 	= filterGreaterThan(data,pivot)
            if(position == "LEFT"){
                for(var i in leftUnsorted){
                    ref.postMessage(["newData",leftUnsorted[i]])
                }
            }
            else{
                for(var i in rightUnsorted){
                    ref.postMessage(["newData",rightUnsorted[i]])
                }
            }
            ref.postMessage(["configDone"])
            ref.postMessage(["sort"])
        }

        function gotResult(res,fromPosition){
            if(!(data.length == 0)){
                if(fromPosition == "LEFT"){
                    var temp = []
                    for(var i in result){
                        temp.push(result[i])
                    }
                    for(var i in res){
                        temp.push(res[i])
                    }
                    result = temp
                }
                else if(fromPosition == "RIGHT"){
                    var temp = []
                    for(var i in res){
                        temp.push(res[i])
                    }
                    for(var i in result){
                        temp.push(result[i])
                    }
                    this.result = temp
                }
            }
            numFragments += 1
            if(numFragments == 3){
                notifyParentAndTerminate()
            }
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2],event.data[3],event.data[4],event.ports[0],event.data[5])
                break;
            case "newData":
                newData(event.data[1])
                break;
            case "configDone":
                configDone()
                break;
            case "sort":
                sort()
                break;
            case "childSpawned":
                childSpawned(event.ports[0],event.data[1])
                break;
            case "gotResult":
                gotResult(event.data[1],event.data[2])
                break;
            default :
                console.log("Unknown message (Actor): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}