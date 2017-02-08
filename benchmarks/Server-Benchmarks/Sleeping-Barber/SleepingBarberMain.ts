import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
export class NodeSleepingBarberBench extends SpiderBenchmark{
    static _BARBER_PORT_ = 8001
    static _WAITING_PORT_ = 8002
    static _CUSTOMER_PORT_ = 8003
    lastPort = 8004
    customers : Array<ClientBufferSocket>
    barberRef : ClientBufferSocket
    waitingRoomRef : ClientBufferSocket
    customerFactoryRef : ClientBufferSocket
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Sleeping Barber","Node Sleeping Barber cycle completed","Node Sleeping Barber completed","Node Sleeping Barber scheduled")
        this.customers = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this
        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.barberNrHaircuts +  3){
                    that.customerFactoryRef.emit(["start"])
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
                default :
                    console.log("Unknown message: " + data[0])
            }
        }
        that.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,sysHandle)
        that.barberRef = that.spawnNode("Sleeping-Barber/SleepingBarberBarber",sysHandle,NodeSleepingBarberBench._BARBER_PORT_)
        that.barberRef.emit(["config",BenchConfig.barberHaircut])
        that.waitingRoomRef = that.spawnNode("Sleeping-Barber/SleepingBarberWaitingRoom",sysHandle,NodeSleepingBarberBench._WAITING_PORT_)
        that.waitingRoomRef.emit(["config",BenchConfig.barberWaitingRoom,NodeSleepingBarberBench._BARBER_PORT_])
        that.barberRef.emit(["linkRoom",NodeSleepingBarberBench._WAITING_PORT_])
        that.customerFactoryRef = that.spawnNode("Sleeping-Barber/SleepingBarberCustomerFactory",sysHandle,NodeSleepingBarberBench._CUSTOMER_PORT_)
        that.waitingRoomRef.emit(["link",NodeSleepingBarberBench._CUSTOMER_PORT_])
        that.customerFactoryRef.emit(["config",BenchConfig.barberNrHaircuts,BenchConfig.barberProduction,NodeSleepingBarberBench._WAITING_PORT_])
        var custCount 			= BenchConfig.barberNrHaircuts - 1
        while(custCount >= 0){
            var newCust = that.spawnNode("Sleeping-Barber/SleepingBarberCustomer",sysHandle,that.lastPort)
            newCust.emit(["config",NodeSleepingBarberBench._CUSTOMER_PORT_])
            that.customerFactoryRef.emit(["newCustomer",that.lastPort])
            that.customers.push(newCust)
            that.lastPort++
            custCount -= 1
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.customers = []
    }
}