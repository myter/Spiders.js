/**
 * Created by flo on 25/01/2017.
 */
module.exports = function(self){
    var masterRef =		 null
    var listRef =		 null
    var writePercentage = 0
    var sizePercentage =  0
    var totalMsgs =		 0
    var currentMsgs = 	 0

    function mHandler(event){
        function linkMaster(master){
            masterRef = master
            masterRef.onmessage = mHandler
        }

        function linkList(list){
            listRef = list
            listRef.onmessage = mHandler
        }

        function config(wp,sp,ts){
            writePercentage 	= wp
            sizePercentage 	= sp
            totalMsgs			= ts
            self.postMessage(["actorInit"])
        }

        function getRandom(){
            return Math.floor(Math.random() * (100 - 0 + 1)) + 0;
        }

        function work(){
            currentMsgs += 1
            if(currentMsgs <= totalMsgs){
                var rand = getRandom()
                var chan = new MessageChannel()
                chan.port2.onmessage = mHandler
                if(rand < sizePercentage){
                    listRef.postMessage(["read"],[chan.port1])
                }
                else if(rand < writePercentage){
                    var item = getRandom()
                    listRef.postMessage(["write",item],[chan.port1])
                }
                else{
                    var item = getRandom()
                    listRef.postMessage(["cont",item],[chan.port1])
                }
            }
            else{
                masterRef.postMessage(["workerDone"])
            }
        }

        switch(event.data[0]){
            case "linkMaster":
                linkMaster(event.ports[0])
                break;
            case "linkList":
                linkList(event.ports[0])
                break;
            case "config":
                config(event.data[1],event.data[2],event.data[3])
                break;
            case "work":
                work()
                break;
            default :
                console.log("Unknown message: " + event.data[0])
        }
    }
    self.addEventListener('message',mHandler)
}