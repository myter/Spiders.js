/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var masterRef = null
    var id = 		null

    function mHandle(event){
        function config(master,i){
            masterRef 	= master
            masterRef.onmessage = mHandle
            id 		= i
            self.postMessage(["actorInit"])
        }

        function fx(x){
            var a = Math.sin(Math.pow(x,3) - 1)
            var b = x + 1
            var c = a / b
            var d = Math.sqrt(1 + Math.exp(Math.sqrt(2 * x)))
            var r = c * d
            return r
        }

        function work(wl,wr,precision){
            var n 			= ((wr - wl) / precision)
            var accumArea 	= 0.0
            var i  			= 0
            while(i < n){
                var lx 		= (i * precision) + wl
                var rx 		= lx + precision
                var ly 		= fx(lx)
                var ry 		= fx(rx)
                var area 	= 0.5 * (ly + ry) * precision
                accumArea  += area
                i 		   += 1
            }
            masterRef.postMessage(["result",accumArea,id])
            self.postMessage(["actorExit"])
        }

        switch(event.data[0]){
            case "config":
                config(event.ports[0],event.data[1])
                break;
            case "work":
                work(event.data[1],event.data[2],event.data[3])
                break;
            default :
                console.log("Unknown message (Worker): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}