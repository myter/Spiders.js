import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var parent : ClientBufferSocket = 			null
var parentPort
var root : ClientBufferSocket = 				null
var rootPort
var height =			null
var id =				null
var comp = 				null
var urgent = 			null
var binomial = 			null
var children : Array<ClientBufferSocket> = 			[]
var hasGrantChildren = 	[]
var hasChildren = 		false
var urgentChild =		null
var inTermination = 	false
var partId = Math.random()
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){
    function config(h,i,c,u,b,rp){
        root 		= new ClientBufferSocket(rp,mHandle)
        rootPort = rp
        height 	= h
        id 		= i
        comp 	= c
        urgent 	= u
        binomial 	= b
        tryGenerate()
    }

    function linkParent(refPort){
        parent = new ClientBufferSocket(refPort,mHandle)
        parentPort = refPort
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
    }

    function loop(busywait,dummy){
        var test = 0;
        for (var k = 0; k < dummy * busywait; k++) {
            test += 1;
        }
        return test;
    }

    function tryGenerate(){
        loop(1000,100000)
        if(root == null){
            setTimeout(()=>{
                tryGenerate()
            },100)
        }
        else{
            root.emit(["shouldGenerateChildren",height,myPort])
        }
    }

    function generateChildren(currentId,compSize){
        var myArrayId 		= id % binomial
        parent.emit(["updateGrant",myArrayId])
        var childrenHeight 	= height + 1
        var idValue 		=  currentId
        var i 				= 0
        while(i < binomial){
            socketToMain.emit(["spawnNodeP1",childrenHeight,idValue + 1,compSize,false,partId,rootPort])
            socketToMain.emit(["spawnNodeP2",partId,myPort])
            partId += 1
            i += 1
        }
        hasChildren = true
    }

    function generateUrgentChildren(urgentChildId, currentId, compSize){
        var myArrayId = id % binomial
        parent.emit(["updateGrant",myArrayId])
        var childrenHeight = height + 1
        var idValue = currentId
        urgentChild = urgentChildId
        var i = 0
        while(i < binomial){
            socketToMain.emit(["spawnNodeP1",childrenHeight,idValue + 1,compSize,i == urgentChildId,partId,rootPort])
            socketToMain.emit(["spawnNodeP2",partId,myPort])
            partId += 1
            i += 1
        }
        hasChildren = true
    }

    function childSpawned(childPort){
        var child = new ClientBufferSocket(childPort,mHandle)
        children.push(child)
        child.emit(["tryGenerate"])
        if(inTermination){
            child.emit(["terminate"])
        }
    }

    function updateGrant(id){
        hasGrantChildren[id] = true
    }

    function traverse(){
        loop(comp,40000)
        if(hasChildren){
            for(var i in children){
                children[i].emit(["traverse"])
            }
        }
    }

    function terminate(){
        if(hasChildren){
            for(var i in children){
                children[i].emit(["terminate"])
            }
        }
        inTermination = true
        socketToMain.emit(["endNode",id])
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3],data[4],data[5],data[6])
            break;
        case "linkParent":
            linkParent(data[1])
            break;
        case "link":
            link(data[1])
            break;
        case "tryGenerate":
            tryGenerate()
            break;
        case "generateChildren":
            generateChildren(data[1],data[2])
            break;
        case "generateUrgentChildren":
            generateUrgentChildren(data[1],data[2],data[3])
            break;
        case "childSpawned":
            childSpawned(data[1])
            break;
        case "updateGrant":
            updateGrant(data[1])
            break;
        case "traverse":
            traverse()
            break;
        case "terminate":
            terminate()
            break;
        default :
            console.log("Unknown message (Node): " + data[0])
    }

}