/**
 * Created by flo on 26/01/2017.
 */
module.exports = function (self) {
    var masterRef = 	null
    var threshold = 	null
    var grid = 		null
    var gridSize = 	null

    function mHandle(event){
        //Graph stuff
        function makeNode(id,i,j,k,neighbors){
            return [id,i,j,k,neighbors,id == 0 ? 0 : -1,null]
        }
        function getId(node){
            return node[0]
        }
        function getI(node){
            return node[1]
        }
        function getJ(node){
            return node[2]
        }
        function getK(node){
            return node[3]
        }
        function getNeighbors(node){
            return node[4]
        }
        function getDistanceFromRoot(node){
            return node[5]
        }
        function setDistanceFromRoot(node,dist){
            node[5] =  dist
        }
        function getParentInPath(node){
            return node[6]
        }
        function setParentInPath(node,newParent){
            node[6] = newParent
        }
        function setParent(node,newParent){
            var success = getParentInPath(node) == null
            if(success){
                setParentInPath(node,newParent)
                setDistanceFromRoot(node,getDistanceFromRoot(node) + distanceFrom(node,newParent))
            }
            return success
        }
        function distanceFrom(node1,node2){
            var iDiff = getI(node1) - getI(node2)
            var jDiff = getJ(node1) - getJ(node2)
            var kDiff = getK(node1) - getK(node2)
            return Math.sqrt((iDiff * iDiff) + (jDiff * jDiff) + (kDiff * kDiff))
        }
        function addNeighbor(node,newNeighbor){
            var currentNeighbours = node[4]
            if(getId(newNeighbor) == getId(node)){
                return false
            }
            else{
                var alreadyIn = false
                for(var i in currentNeighbours){
                    if(getId(currentNeighbours[i]) == getId(newNeighbor)){
                        alreadyIn = true
                    }
                }
                if(!alreadyIn){
                    currentNeighbours.push(newNeighbor)
                }
                return (!alreadyIn)
            }
        }
        function randBool(){
            var val = Math.floor(Math.random() * (2 - 0) + 0)
            if(val == 0){
                return false
            }
            else{
                return true
            }
        }
        function generateData(){
            var allNodes 	= {}
            var id 			= 0
            for(var i = 0;i < gridSize;i++){
                for(var j = 0;j < gridSize;j++){
                    for(var k = 0;k < gridSize;k++){
                        var node = makeNode(id,i,j,k,[])
                        allNodes[id] = node
                        id++
                    }
                }
            }
            for(var a in allNodes){
                var gridNode 		= allNodes[a]
                var iterCount 		= 0
                var neighborCount	= 0
                for(var i = 0;i < 2;i++){
                    for(var j = 0;j < 2;j++){
                        for(var k = 0;k < 2;k++){
                            iterCount++
                            if(iterCount != 1 && iterCount != 8){
                                var b = (iterCount == 7 && neighborCount == 0) || randBool()
                                if(b){
                                    var newI 	= Math.min(gridSize - 1,getI(gridNode) + i)
                                    var newJ 	= Math.min(gridSize - 1,getJ(gridNode) + j)
                                    var newK 	= Math.min(gridSize - 1,getK(gridNode) + k)
                                    var newId 	= (gridSize * gridSize * newI) + (gridSize * newJ) + newK
                                    var newNode	= allNodes[newId]
                                    if(addNeighbor(gridNode,newNode)){
                                        neighborCount++
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return allNodes
        }

        function config(master,thresh,gs){
            masterRef 	= master
            masterRef.onmessage = mHandle
            threshold 	= thresh
            gridSize 	= gs
            grid 		= generateData()
            self.postMessage(["actorInit"])
        }

        function work(origin,target){
            var workQueue 		= []
            workQueue.push(origin)
            var nodesProcessed 	= 0
            while(!(workQueue.length == 0) && nodesProcessed < threshold){
                nodesProcessed += 1
                //Busy wait
                for(var i = 0;i < 100;i++){
                    Math.random()
                }
                var loopNode 		= workQueue.pop()
                var numNeighbors 	= (getNeighbors(loopNode)).length
                var i = 0
                while(i < numNeighbors){
                    var loopNeighbor 	= getNeighbors(loopNode)[i]
                    var success 		= setParent(loopNeighbor,loopNode)
                    masterRef.postMessage(["updateNodeParent",getId(loopNeighbor),loopNode])
                    if(success){
                        if(getId(loopNeighbor) == getId(target)){
                            masterRef.postMessage(["done"])
                        }
                        else{
                            //Obviously scandalous regarding efficiency but will do for the moment
                            workQueue.reverse()
                            workQueue.push(loopNeighbor)
                            workQueue.reverse()
                        }
                    }
                    i += 1
                }
            }
            while(!(workQueue.length == 0)){
                var loopNode = workQueue.pop()
                masterRef.postMessage(["sendWork",loopNode,target])
            }
        }


        function stop(){
            masterRef.postMessage(["stop"])
        }

        switch(event.data[0]){
            case "config":
                config(event.ports[0],event.data[1],event.data[2])
                break;
            case "work":
                work(event.data[1],event.data[2])
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