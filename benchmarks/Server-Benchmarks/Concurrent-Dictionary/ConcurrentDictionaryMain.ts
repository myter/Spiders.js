import {ClientBufferSocket, SpiderBenchmark, BenchConfig, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
export class NodeConcurrentDictionaryBench extends SpiderBenchmark{
    static _MASTER_PORT_ = 8001
    static _DICT_PORT = 8002
    lastPort = 8003
    actors : Array<ClientBufferSocket>
    masterRef : ClientBufferSocket
    dictRef : ClientBufferSocket
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Concurrent Dictionary","Node Concurrent Dictionary cycle completed","Node Concurrent Dictionary completed","Node Concurrent Dictionary scheduled")
        this.actors = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandler(data){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.cDictActors + 2){
                    for(var i in that.actors){
                        that.actors[i].emit(["work"])
                    }
                }
            }

            function actorInit(){
                actorsInitialised += 1
                checkConfig()
            }

            function end(){
                that.stopPromise.resolve()
            }

            switch(data[0]){
                case "actorInit":
                    actorInit()
                    break;
                case "end":
                    end()
                    break;
            }
        }
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandler)
        that.masterRef = that.spawnNode('Concurrent-Dictionary/ConcurrentDictionaryMaster',sysHandler,NodeConcurrentDictionaryBench._MASTER_PORT_)
        that.masterRef.emit(["config",BenchConfig.cDictActors])
        that.dictRef = that.spawnNode("Concurrent-Dictionary/ConcurrentDictionaryDictionary",sysHandler,NodeConcurrentDictionaryBench._DICT_PORT)
        var count = BenchConfig.cDictActors
        while(count > 0){
            var newActor = that.spawnNode("Concurrent-Dictionary/ConcurrentDictionaryWorker",sysHandler,that.lastPort)
            that.actors.push(newActor)
            that.masterRef.emit(["link",that.lastPort])
            that.dictRef.emit(["link",that.lastPort])
            newActor.emit(["linkMaster",NodeConcurrentDictionaryBench._MASTER_PORT_])
            newActor.emit(["linkDict",NodeConcurrentDictionaryBench._DICT_PORT])
            newActor.emit(["config",BenchConfig.cDictWrite,BenchConfig.cDictMsgs])
            that.lastPort++
            count -= 1
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.actors = []
    }
}