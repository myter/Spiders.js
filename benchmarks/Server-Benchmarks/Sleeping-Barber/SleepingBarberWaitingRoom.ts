import {ClientBufferSocket, ServerBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var capacity    = 0
var waiting     = []
var barberRef : ClientBufferSocket  = null
var barberSleep = true
var knownCustomers : Map<number,ClientBufferSocket> = new Map()
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandle)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandle)

function mHandle(data){

    function config(cap,barberPort){
        capacity = cap
        barberRef = new ClientBufferSocket(barberPort,mHandle)
        socketToMain.emit(["actorInit"])
    }

    function customerEnter(customerPort){
        if(knownCustomers.has(customerPort)){
            var customer = knownCustomers.get(customerPort)
        }
        else{
            var customer = new ClientBufferSocket(customerPort,mHandle)
            knownCustomers.set(customerPort,customer)
        }
        if(waiting.length == capacity){
            customer.emit(["roomFull"])
        }
        else{
            waiting.push(customerPort)
            if(barberSleep){
                barberSleep = false
                nextCustomer()
            }
        }
    }

    function nextCustomer(){
        if(waiting.length > 0){
            var customerPort = waiting.pop()
            barberRef.emit(["newCustomer",customerPort])
        }
        else{
            barberSleep = true
        }
    }

    function link(refPort){
        new ClientBufferSocket(refPort,mHandle)
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2])
            break;
        case "customerEnter":
            customerEnter(data[1])
            break;
        case "nextCustomer":
            nextCustomer()
            break;
        case "link":
            link(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}