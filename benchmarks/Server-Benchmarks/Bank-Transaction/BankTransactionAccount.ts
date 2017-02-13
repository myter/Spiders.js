import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var balance = 0
var tellerRef : ClientBufferSocket = null
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)
var knownDestinations : Map<number,ClientBufferSocket> = new Map()

function mHandle(data){
    function config(initialBalance,tellerPort){
        balance = initialBalance
        tellerRef = new ClientBufferSocket(tellerPort,mHandle)
        socketToMain.emit(["actorInit"])
    }

    function credit(amount,destinationPort){
        balance -= amount
        if(knownDestinations.has(destinationPort)){
            var destination = knownDestinations.get(destinationPort)
        }
        else{
            var destination = new ClientBufferSocket(destinationPort,mHandle)
            knownDestinations.set(destinationPort,destination)
        }
        destination.emit(["debit",amount])
    }

    function debit(amount){
        balance += amount
        setTimeout(function(){
            tellerRef.emit(["transactionDone"])
        },100)
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2])
            break;
        case "credit":
            credit(data[1],data[2])
            break;
        case "debit":
            debit(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}