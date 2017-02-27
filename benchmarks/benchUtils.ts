
import BenchmarkType = require("../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_benchmark_index");
/**
 * Created by flo on 24/01/2017.
 */
export class BenchConfig {
    //Ping pong 
    static pingAmount           = 10000
    //Count 
    static count                = 50000
    //Fork join throughput 
    static fjThroughputActors   = 10
    static fjThroughputMessages = 10000
    //Fork join creation 
    static fjCreationActors     = 30
    //Thread ring 
    static threadRingActors     = 10
    static threadRingPings      = 10000
    //Chameneo 
    static chameneoMeetings     = 1000
    static chameneoActors       = 20
    //Big config
    static bigActors            = 10
    static bigPings             = 1500
    //Concurrent Dictionary 
    static cDictActors          = 10
    static cDictMsgs            = 1000
    static cDictWrite           = 500
    //Concurrent sorted linked list
    static cLinkedListActors    = 20
    static cLinkedListMsgs      = 500
    static cLinkedListWrites    = 50
    static cLinkedListSize      = 50
    //Producer Consumer
    static prodConBuffer        = 50
    static prodConProd          = 5
    static prodConCon           = 5
    static prodConItems         = 100
    static prodConProdCost      = 25
    static prodConConCost       = 25
    //Philosopher
    static philosopherActors    = 10
    static philosopherEating    = 300
    //Barber
    static barberNrHaircuts     = 20
    static barberWaitingRoom    = 10
    static barberProduction     = 5000000
    static barberHaircut        = 50000
    //Cigarette Smokers
    static cigSmokeRounds       = 5000
    static cigSmokeSmokers      = 10
    //Logistic map
    static logMapTerms          = 200
    static logMapSeries         = 9
    static logMapStartRate      = 3.46
    static logMapIncrement      = 0.0025
    //Banking
    static bankingAccounts      = 20
    static bankingTransactions  = 5000
    static bankingInitialBalance= BenchConfig.bankingAccounts * BenchConfig.bankingTransactions
    //Radix sort
    static radixSortDataSize    = 1000
    static radixSortMaxVal      = 5000
    //Filter bank
    static filterBankColumns    = 8192 * 2
    static filterBankSimulations= 500
    static filterBankChannels   = 2
    //Sieve
    static sieveLimit           = 100000
    static sieveLocal           = 50000
    //UCT
    static uctMaxNodes          = 20
    static uctAvgCompSize       = 1000
    static uctStdevCompSize     = 500
    static uctBinomial          = 5
    static uctPercent           = 70
    //Fac loc
    static facLocNumPoints      = 1000
    static facLocGridSize       = 500
    static facLocF              = Math.sqrt(2) * 500
    static facLocAlpha          = 4.0
    static facLocCuttOff        = 5
    //Trapezoid
    static trapezoidPieces      = 50000000
    static trapezoidWorkers     = 10
    static trapezoidLeft        = 1
    static trapezoidRight       = 5
    //Pi Precision
    static piPrecisionWorkers   = 10
    static piPrecisionPrecision = 10
    //Matrix Multiplication
    static matMulWorkers        = 20
    static matMulDataLength     = 512
    static matMulThreshold      = 8192
    //Quicksort
    static quickDataSize        = 5000
    static quickMaxVal          = 1 << 60
    static quickThreshold       = 3000
    //All pair shortes path
    static apspN                = 20
    static apspB                = 5
    static apspW                = 10
    //Successive over relaxation
    static sorRefVal            = [0.000003189420084871275,0.001846644602759566,0.0032099996270638005,0.0050869220175413146,0.008496328291240363,0.016479973604143234,0.026575660248076397,1.026575660248076397,2.026575660248076397,3.026575660248076397]
    static sorDataSizes         = [2,5,20,80,100,120,150,200,250,300,350,400]
    static sorJacobi            = 100
    static sorOmega             = 1.25
    static sorN                 = 1
    //A star search 
    static aStarWorkers         = 20
    static aStarThreshold       = 100
    static aStarGridSize        = 5
    //N queens
    static nQueensWorkers       = 10
    static nQueensSize          = 6
    static nQueensThreshold     = 3
    static nQueensSolutions     = 1500
    static nQueensPriorities    = 10

    //Filter (used for speedup), not part of savina benchmark suite
    static filterImageSize      = 30000
    static filterImageWorkers   = 0
    static makeFilterImage(){
        var res = []
        for(var i = 0;i < BenchConfig.filterImageSize;i++){
            res[i] = Math.floor(Math.random() * 255) + 0
        }
        return {
            data : res,
            width: Math.ceil((BenchConfig.filterImageSize / 4) / 2),
            height : Math.ceil((BenchConfig.filterImageSize / 4) / 2)
        }
    }
    static filterBaseKernal     = [[0 , -1 ,  0], [-1,  2 , -1], [0 , -1 ,  0]]

    //Monte carlo (used for speedup), not part of savina benchmark suite
    static monteCarloRuns = 0
    static monteCarloWorkers = 0
    static monteCarloMax = 50000000
}
var Benchmark = require('benchmark');
var isNode = false;
if (typeof process === 'object') {
    if (typeof process.versions === 'object') {
        if (typeof process.versions.node !== 'undefined') {
            isNode = true;
        }
    }
}

if(!isNode){
    (window as any).Benchmark = Benchmark;

}
import Options = BenchmarkType.Options;
import {fork} from "child_process";
import {ChildProcess} from "child_process";
import {Socket} from "net";

export class SpiderBenchmarkRunner{
    scheduled       : Array<BenchmarkType>
    adapt           : Array<Function>
    currentBench    : number


    constructor(){
        this.scheduled = []
        this.adapt  = []
    }

    schedule(benchmarkClass,adapt = () => {}){
        var that = this
        var spiderBench = new benchmarkClass()
        var bench = new Benchmark(spiderBench.name,{
            defer: true,
            async: true,
            fn: function(deffered){
                spiderBench.setBenchDone(deffered)
                spiderBench.runBenchmark()
            },
            teardown: function(){
                spiderBench.cleanUp()
            },
            onCycle: function(){
                console.log(spiderBench.cycleMessage)
                console.log("Current mean: " + (this as any).stats.mean)
            },
            onComplete: function(){
                if(isNode){
                    var fs = require('fs');
                    fs.appendFile('results.txt', '\n' + spiderBench.completeMessage + (this as any).stats.mean + ' . ' + 'Error margin: ' + (this as any).stats.moe, function (err) {
                    });
                }
                //This will actually be bound to type
                console.log(spiderBench.completeMessage + (this as any).stats.mean)
                console.log("Error margin: " + (this as any).stats.moe)
                console.log((this as any).stats.sample.toString())
                spiderBench.cleanUp()
                that.nextBenchmark()
            },
        })
        this.scheduled.push(bench)
        this.adapt.push(adapt)
        console.log(spiderBench.scheduleMessage)
    }

    nextBenchmark(){
        this.currentBench += 1
        if(this.scheduled.length != 0){
            this.adapt.pop()()
            this.scheduled.pop().run()
        }
    }
}

abstract class BufferSocket{
    socket          : Socket
    connected       : boolean
    bufferedMsgs    : Array<Array<any>>

    constructor(socket,messageHandler){
        this.socket         = socket
        this.connected      = false
        this.bufferedMsgs   = []
    }

    flushMessages(){
        this.bufferedMsgs.forEach((data : Array<any>)=>{
            this.emit(data)
        })
    }

    emit(data : Array<any>){
        if(this.connected){
            this.socket.emit('message',data)
        }
        else{
            this.bufferedMsgs.push(data)
        }
    }

    close(){
        (this.socket as any).close()
    }
}

export class ClientBufferSocket extends BufferSocket{

    constructor(port : number,messageHandler){
        super(require('socket.io-client')('http://127.0.0.1:'+ port),messageHandler)
        var that            = this
        this.socket.on('message',messageHandler)
        this.socket.on('connect',()=>{
            that.connected = true
            that.flushMessages()
        })
    }
}

export class ServerBufferSocket extends BufferSocket{
    constructor(port : number,messageHandler){
        var socket = require('socket.io')(port)
        super(socket,messageHandler)
        socket.on('connect',(client)=>{
            client.on('message',messageHandler)
        })
    }
}

export abstract class SpiderBenchmark{
    stopPromise
    name            : string
    cycleMessage    : string
    completeMessage : string
    scheduleMessage : string
    spawnWorker
    spawnedNodes    : Array<any>
    allSockets      : Array<BufferSocket>
    static _MAIN_PORT_ : number = 8000

    constructor(name : string,cycleMessage : string,completeMessage : string,scheduleMessage : string){
        this.name               = name
        this.cycleMessage       = cycleMessage
        this.completeMessage    = completeMessage
        this.scheduleMessage    = scheduleMessage
        this.spawnWorker        = require('webworkify')
        this.spawnedNodes       = []
        this.allSockets         = []
    }

    spawnNode(filePath,messageHandler,port){
        var instance    = fork(__dirname + "/Server-Benchmarks/" + filePath,[port])
        this.spawnedNodes.push(instance)
        var childSocket = new ClientBufferSocket(port,messageHandler)
        this.allSockets.push(childSocket)
        return childSocket
    }

    setBenchDone(benchDone : Function){
        this.stopPromise = benchDone
    }

    cleanWorkers(workerRefs){
        workerRefs.forEach((worker) => {
            worker.terminate()
        })
    }

    cleanNodes(){
        this.spawnedNodes.forEach((nodeInstance : ChildProcess)=>{
            nodeInstance.kill()
        })
        this.allSockets.forEach((socket : BufferSocket)=>{
            socket.close()
        })
    }

    abstract runBenchmark()
    abstract cleanUp()
}