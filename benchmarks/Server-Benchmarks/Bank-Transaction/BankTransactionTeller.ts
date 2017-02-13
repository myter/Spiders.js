import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark} from "../../benchUtils";
/**
 * Created by flo on 09/02/2017.
 */
var totalAccounts = 			0
var totalTransactions =		0
var accounts : Map<number,ClientBufferSocket> = new Map()
var currentTransactions = 	0
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)

function mHandler(data){

    function newAccount(ta,tt,accountPort){
        totalAccounts 		= ta
        totalTransactions 	= tt
        var account = new ClientBufferSocket(accountPort,mHandler)
        accounts.set(accountPort,account)
        if(totalAccounts == accounts.size){
            socketToMain.emit(["actorInit"])
        }
    }

    function getRandom(upper){
        return Math.floor(Math.random() * (upper - 0) + 0)
    }

    function getAccount(index){
        var i = 0
        var foundPort
        var foundAccount
        accounts.forEach((account : ClientBufferSocket,accountPort : number)=>{
            if(i == index){
                foundPort = accountPort
                foundAccount = account
            }
            i++
        })
        return [foundPort,foundAccount]
    }

    function start(){
        var i = 0
        while(i < totalTransactions){
            generateWork()
            i++
        }
    }

    function generateWork(){
        var sourceIndex = getRandom(accounts.size)
        var destIndex   = getRandom(accounts.size)
        if(destIndex == sourceIndex){
            destIndex = (destIndex + 1) % accounts.size
        }
        var [_,sourceAccount] = getAccount(sourceIndex)
        var [destAccountPort,_] = getAccount(destIndex)
        var amount 			= getRandom(1000)
        sourceAccount.emit(["credit",amount,destAccountPort])
    }

    function transactionDone(){
        currentTransactions += 1
        if(currentTransactions == totalTransactions){
            socketToMain.emit(["end"])
        }
    }

    switch(data[0]){
        case "newAccount":
            newAccount(data[1],data[2],data[3])
            break;
        case "start":
            start()
            break;
        case "generateWork":
            generateWork()
            break;
        case "transactionDone":
            transactionDone()
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}