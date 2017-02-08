import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
import {NodeCountBench} from "./CountMain";
/**
 * Created by flo on 07/02/2017.
 */
var totalCount  =  null
var countsLeft  =  null
var countRef : ClientBufferSocket    = 	null
new ServerBufferSocket(NodeCountBench._PROD_WORKER_PORT_,produceHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,produceHandler)
function produceHandler(data){
    function config(countNumber){
        totalCount = countNumber
        countsLeft = countNumber
        countRef = new ClientBufferSocket(NodeCountBench._COUNT_WORKER_PORT,produceHandler)
        socketToMain.emit(["prodInit"])
    }

    function start(){
        countsLeft = totalCount
        countRef.emit(["inc",true])
        while(countsLeft > 0){
            countRef.emit(["inc",false])
            countsLeft -= 1
        }
    }

    switch(data[0]){
        case "config":
            config(data[1])
            break;
        case "start":
            start()
            break;
    }
}