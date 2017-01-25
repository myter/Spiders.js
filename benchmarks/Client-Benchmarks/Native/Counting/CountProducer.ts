/**
 * Created by flo on 25/01/2017.
 */


module.exports = function(self){
    var thisWorker = self
    var totalCount =  null
    var countsLeft =  null
    var countRef = 	null
    function produceHandler(event){
        function config(countNumber,counter){
            totalCount = countNumber
            countsLeft = countNumber
            countRef = counter
            countRef.onmessage = produceHandler
            thisWorker.postMessage(["prodInit"])
        }

        function start(){
            countsLeft = totalCount
            countRef.postMessage(["inc",true])
            while(countsLeft > 0){
                countRef.postMessage(["inc",false])
                countsLeft -= 1
            }
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.ports[0])
                break;
            case "start":
                start()
                break;
        }
    }
    self.addEventListener('message',produceHandler)
}