import {SpiderBenchmark, BenchConfig, ClientBufferSocket, ServerBufferSocket} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
export class NodeBankTransactionBench extends SpiderBenchmark{
    static _TELLER_PORT_ = 8001
    lastPort = 8002
    tellerRef : ClientBufferSocket
    accounts : Array<ClientBufferSocket>
    mainSocket : ServerBufferSocket

    constructor(){
        super("Node Banking transaction","Node Banking Transaction cycle completed","Node Banking Transaction completed","Node Banking Transaction scheduled")
        this.accounts = []
    }

    runBenchmark(){
        var actorsInitialised   = 0
        var that                = this

        function sysHandle(data){
            function checkConfig(){
                if(actorsInitialised == BenchConfig.bankingAccounts + 1){
                    that.tellerRef.emit(["start"])
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
        that.tellerRef = that.spawnNode("Bank-Transaction/BankTransactionTeller",sysHandle,NodeBankTransactionBench._TELLER_PORT_)
        var accCount 	= BenchConfig.bankingAccounts - 1
        while(accCount >= 0){
            var newAcc = that.spawnNode("Bank-Transaction/BankTransactionAccount",sysHandle,that.lastPort)
            that.accounts.push(newAcc)
            that.tellerRef.emit(["newAccount",BenchConfig.bankingAccounts,BenchConfig.bankingTransactions,that.lastPort])
            newAcc.emit(["config",BenchConfig.bankingInitialBalance,NodeBankTransactionBench._TELLER_PORT_])
            that.lastPort++
            accCount -= 1
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
        this.accounts = []
    }
}