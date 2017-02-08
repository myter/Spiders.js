import {ServerBufferSocket, ClientBufferSocket, SpiderBenchmark, BenchConfig} from "../../benchUtils";
/**
 * Created by flo on 08/02/2017.
 */
var listHead =  null
var myPort = parseInt(process.argv[2])
new ServerBufferSocket(myPort,mHandler)
var socketToMain = new ClientBufferSocket(SpiderBenchmark._MAIN_PORT_,mHandler)
var refs : Map<number,ClientBufferSocket> = new Map()
var linked = 0
function mHandler(data){
    function newNode(item){
        return {item: item,next: null}
    }

    function addNode(item){
        var node = newNode(item)
        if(listHead == null){
            listHead = node
        }
        else if(item < listHead.item){
            node.next = listHead
            listHead = node
        }
        else{
            var after = listHead.next
            var before = listHead
            while(after != null){
                if(item  < after.item){
                    break
                }
                before = after
                after = after.next
            }
            node.next = before.next
            before.next = node
        }
    }

    function contains(item){
        var n = listHead
        while(n != null){
            if(item < n.item){
                return true
            }
            n = n.next
        }
        return false
    }

    function size(){
        var total = 0
        var n = listHead
        while(n != null){
            total += 1
            n = n.next
        }
        return total
    }

    function read(senderPort){
        var length = size()
        var sender = refs.get(senderPort)
        sender.emit(["work"])
    }

    function write(value,senderPort){
        addNode(value)
        var sender = refs.get(senderPort)
        sender.emit(["work"])
    }

    function cont(value,senderPort){
        var res = contains(value)
        var sender = refs.get(senderPort)
        sender.emit(["work"])
    }

    function link(refPort){
        linked++
        var refSocket = new ClientBufferSocket(refPort,mHandler)
        refs.set(refPort,refSocket)
        if(linked == BenchConfig.cLinkedListActors){
            socketToMain.emit(["actorInit"])
        }
    }

    switch(data[0]){
        case "read":
            read(data[1])
            break;
        case "write":
            write(data[1],data[2])
            break;
        case "cont":
            cont(data[1],data[2])
            break;
        case "link":
            link(data[1])
            break;
        default :
            console.log("Unknown message: " + data[0])
    }
}