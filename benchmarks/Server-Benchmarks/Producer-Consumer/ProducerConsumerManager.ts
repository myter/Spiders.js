import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var allConsumers =		[]
var availableConsumers = []
var availableProducers = []
var totalConsumers = 	0
var totalProducers = 	0
var adjustBuffer = 	0
var producersStopped =	0
var pendingData = 		[]
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)
var refs  : Map<number,ClientBufferSocket> = new Map()
var linked = 0
function mHandler(data){
    function config(bufferSize,tc,tp){
        totalConsumers = tc
        totalProducers = tp
        adjustBuffer = bufferSize - totalProducers
    }

    function registerConsumer(consumerPort){
        linked++
        var consumer = new ClientBufferSocket(consumerPort,mHandler)
        availableConsumers.push(consumer)
        refs.set(consumerPort,consumer)
        if(linked == BenchConfig.prodConCon + BenchConfig.prodConProd){
            socketToMain.emit(["actorInit"])
        }
    }

    function newDataProduced(item,producerPort){
        if(availableConsumers.length == 0){
            pendingData.push(item)
        }
        else{
            var consumer = availableConsumers.pop()
            consumer.emit(["consume",item])
        }
        if(pendingData.length >= adjustBuffer){
            availableProducers.push(refs.get(producerPort))
        }
        else{
            (refs.get(producerPort)).emit(["produce"])
        }
    }

    function consumerAvailable(consumerPort){
        if(pendingData.length == 0){
            availableConsumers.push((refs.get(consumerPort)))
            tryExit()
        }
        else{
            var data = pendingData.pop();
            (refs.get(consumerPort)).emit(["consume",data])
            if(!(availableProducers.length == 0)){
                var producer = availableProducers.pop()
                producer.emit(["produce"])
            }
        }
    }

    function producerStopped(){
        producersStopped += 1
        tryExit()
    }

    function tryExit(){
        if(producersStopped == totalProducers && availableConsumers.length == totalConsumers){
            socketToMain.emit(["end"])
        }
    }

    function link(refPort){
        linked++
        var ref = new ClientBufferSocket(refPort,mHandler)
        refs.set(refPort,ref)
        if(linked == BenchConfig.prodConCon + BenchConfig.prodConProd){
            socketToMain.emit(["actorInit"])
        }
    }

    switch(data[0]){
        case "config":
            config(data[1],data[2],data[3])
            break;
        case "registerConsumer":
            registerConsumer(data[1])
            break;
        case "newDataProduced":
            newDataProduced(data[1],data[2])
            break;
        case "consumerAvailable":
            consumerAvailable(data[1])
            break;
        case "producerStopped":
            producerStopped()
            break;
        case "tryExit":
            tryExit()
            break;
        case "link":
            link(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}