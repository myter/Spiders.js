import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var maxNodes = 			null
var avgComp = 			null
var stdComp = 			null
var binomial = 			null
var percent =			null
var height =			1
var size = 				1
var children : Array<ClientBufferSocket> = 			[]
var hasGrantChildren =	[]
var traversed =			false
var terminated =  		false
var partId = 0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)
var knownChildren : Map<number,ClientBufferSocket> = new Map()

function mHandle(data){
    function config(ms,ac,sc,bin,per){
        maxNodes 	= ms
        avgComp 	= ac
        stdComp 	= sc
        binomial	= bin
        percent		= per
        socketToMain.emit(["actorInit"])
    }

    function getNextNormal(avg,stdev){
        var result = 0
        while(result <= 0){
            var temp = Math.random() * ((100 - 0) + 0) * stdev + avg;
            result = Math.round(temp)
        }
        return result
    }

    function generateTree(){
        height += 1
        var compSize = getNextNormal(avgComp,stdComp)
        var i = 0
        while(i < binomial){
            hasGrantChildren[i] = false
            socketToMain.emit(["spawnNodeP1",height,size + 1,compSize,false,partId,myPort])
            socketToMain.emit(["spawnNodeP2",partId,myPort])
            partId += 1
            i += 1
        }
        size += binomial
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
    }

    function childSpawned(refPort){
        var child = new ClientBufferSocket(refPort,mHandle)
        knownChildren.set(refPort,child)
        children.push(child)
    }

    function traverse(){
        for(var i in children){
            children[i].emit(["traverse"])
        }
    }

    function shouldGenerateChildren(childHeight,childPort){
        if(knownChildren.has(childPort)){
            var child = knownChildren.get(childPort)
        }
        else{
            var child = new ClientBufferSocket(childPort,mHandle)
            knownChildren.set(childPort,child)
        }
        if(size + binomial <= maxNodes){
            var moreChildren = Math.floor(Math.random() * (2 - 0) + 0)
            if(moreChildren == 1){
                var childComp = getNextNormal(avgComp,stdComp)
                var randomInt = Math.floor(Math.random() * (100 - 0) + 0)
                if(randomInt > percent){
                    child.emit(["generateChildren",size,childComp])
                }
                else{
                    child.emit(["generateUrgentChildren",Math.round(Math.random() * (binomial - 0) + 0),size,childComp])
                }
                size += binomial
                if(childHeight + 1 > height){
                    height += childHeight + 1
                }
            }
            else{
                if(childHeight > height){
                    height = childHeight
                }
            }
        }
        else{
            if(!traversed){
                traversed = true
                traverse()
            }
            terminate()
        }
    }

    function updateGrant(id){
        hasGrantChildren[id] = true
    }

    function terminate(){
        if(!terminated){
            for(var i in children){
                children[i].emit(["terminate"])
            }
            socketToMain.emit(["endNode","root"])
            terminated = true
        }
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3],data[4],data[5])
            break;
        case "generateTree":
            generateTree()
            break;
        case "link":
            link(data[1])
            break;
        case "childSpawned":
            childSpawned(data[1])
            break;
        case "traverse":
            traverse()
            break;
        case "shouldGenerateChildren":
            shouldGenerateChildren(data[1],data[2])
            break;
        case "updateGrant":
            updateGrant(data[1])
            break;
        case "terminate":
            terminate()
            break;
        default :
            console.log("Unknown message (Root): " + data[0])
    }
}