import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var producerRef : ClientBufferSocket = 	null
var branchesRef : ClientBufferSocket = 	null
var maxValue =		1000
var current =  		0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){


    function linkProducer(producerPort){
        producerRef = new ClientBufferSocket(producerPort,mHandle)
    }

    function linkBranches(branchesPort){
        branchesRef = new ClientBufferSocket(branchesPort,mHandle)
    }

    function configDone(){
        socketToMain.emit(["actorInit"])
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
    }

    function boot(){
        branchesRef.emit(["valueMessage",current])
        current = (current + 1) % maxValue
        producerRef.emit(["nextMessage"])
    }

    function exit(){
        branchesRef.emit(["exit"])
    }

    switch(data[0]){
        case "linkProducer":
            linkProducer(data[1])
            break;
        case "linkBranches":
            linkBranches(data[1])
            break;
        case "link":
            link(data[1])
            break;
        case "configDone":
            configDone()
            break;
        case "boot":
            boot()
            break;
        case "exit":
            exit()
            break;
        default :
            console.log("Unknown message (Source): " + data[0])
    }
}