/**
 * Created by flo on 25/01/2017.
 */
module.exports = function(self){
    var totalNeighbours = 0
    var neighbours = []
    var exited = 0

    function mHandler(event){
        function neighbour(ref,totalAmount){
            totalNeighbours = totalAmount
            ref.onmessage = mHandler
            neighbours.push(ref)
            if(neighbours.length == totalAmount){
                self.postMessage(["actorInit"])
            }
        }

        function exit(){
            exited += 1
            if(exited == totalNeighbours){
                self.postMessage(["end"])
            }
        }
        switch(event.data[0]){
            case "neighbour":
                neighbour(event.ports[0],event.data[1])
                break;
            case "exit":
                exit()
                break;
            default :
                console.log("Unknown message in sink: " + event.data[0])
        }
    }
    self.addEventListener('message',mHandler)
}