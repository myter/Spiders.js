/**
 * Created by flo on 25/01/2017.
 */
module.exports = function(self){
    var managerRef = 	null
    var prodItem =		0.0
    var totalItems = 	0
    var currentItems = 	0
    var prodCost = 		0
    var stopped =		false

    function mHandler(event){

        function config(ti,pc,manager){
            totalItems = ti
            prodCost 	= pc
            managerRef = manager
            managerRef.onmessage = mHandler
            self.postMessage(["actorInit"])
        }

        function getRandom(upper){
            return Math.floor(Math.random() * (upper - 0 + 1)) + 0;
        }

        function processItem(item,cost){
            var result 	= item
            var rand 	= getRandom(cost)
            if(cost > 0){
                for(var i = 0;i < cost;i++){
                    for(var j = 0;j < 100;j++){
                        result += Math.log(Math.abs(getRandom(100)) + 0.01)
                    }
                }
            }
            else{
                result += Math.log(Math.abs(getRandom(100)) + 0.01)
            }
            return result
        }

        function produce(){
            if(!(stopped)){
                if(currentItems == totalItems){
                    managerRef.postMessage(["producerStopped"])
                    stopped = true
                }
                else{
                    prodItem = processItem(prodItem,prodCost)
                    var chan = new MessageChannel()
                    chan.port2.onmessage = mHandler
                    managerRef.postMessage(["newDataProduced",prodItem],[chan.port1])
                    currentItems += 1
                }
            }
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2],event.ports[0])
                break;
            case "processItem":
                processItem(event.data[1],event.data[2])
                break;
            case "produce":
                produce()
                break;
            default :
                console.log("Unknown message: " + event.data[0])
        }

    }
    self.addEventListener('message',mHandler)
}