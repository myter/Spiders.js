/**
 * Created by flo on 25/01/2017.
 */
module.exports = function(self){
    var haircutRate = null
    var roomRef	    = null

    function mHandle(event){

        function config(hr){
            haircutRate = hr
        }

        function linkRoom(room){
            roomRef = room
            roomRef.onmessage = mHandle
            self.postMessage(["actorInit"])

        }

        function busyWait(limit){
            for(var i = 0;i < limit;i++){
                Math.floor(Math.random() * (limit - 0 + 1)) + 0;
            }
        }

        function newCustomer(customer){
            busyWait(haircutRate)
            customer.postMessage(["done"])
            roomRef.postMessage(["nextCustomer"])
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1])
                break;
            case "linkRoom":
                linkRoom(event.ports[0])
                break;
            case "newCustomer":
                newCustomer(event.ports[0])
                break;
            default :
                console.log("Unknown message: " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}