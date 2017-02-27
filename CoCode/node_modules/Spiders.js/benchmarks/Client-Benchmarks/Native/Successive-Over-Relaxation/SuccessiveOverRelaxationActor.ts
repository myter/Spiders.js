/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var pos = 				null
    var value =				null
    var color =				null
    var nx =				null
    var ny =				null
    var omega = 			null
    var sorSource = 		null
    var peer =				null
//
    var x = 				null
    var y = 				null
    var omega_over_four =  	null
    var one_minus_omega = 	null
    var neighbors = 		[]
    var iter = 				0
    var maxIter =			0
    var msgRcv = 			0
    var sorActors = 		[]
    var mActors =			[]
    var receivedVals = 		0
    var sum =				0.0
    var expectingStart =	true
    var pendingMessages = 	[]

    function mHandle(event){
        function calPos(x1,y1){
            return x1 * ny + y1
        }

        function calcNeighbors(){
            var result = []
            if(x > 0 && x < nx - 1 && y > 0 && y < ny - 1){
                result[0] = calPos(x,y + 1)
                result[1] = calPos(x + 1,y)
                result[2] = calPos(x,y - 1)
                result[3] = calPos(x - 1,y)
            }
            else if((x == 0 || x == (nx - 1)) && (y == 0 || y == (ny - 1))){
                if(x == 0){
                    result[0] = calPos(x + 1,y)
                }
                else{
                    result[0] = calPos(x - 1,y)
                }
                if(y == 0){
                    result[1] = calPos(x,y + 1)
                }
                else{
                    result[1] = calPos(x,y - 1)
                }
            }
            else if((x == 0 || x == (nx - 1)) || (y == 0 || y == (ny - 1))){
                if(x == 0 || x == nx - 1){
                    if(x == 0){
                        result[0] = calPos(x + 1,y)
                    }
                    else{
                        result[0] = calPos(x - 1,y)
                    }
                    result[1] = calPos(x,y + 1)
                    result[2] = calPos(x,y - 1)
                }
                else{
                    if(y == 0){
                        result[0] = calPos(x,y + 1)
                    }
                    else{
                        result[0] = calPos(x,y - 1)
                    }
                    result[1] = calPos(x + 1,y)
                    result[2] = calPos(x - 1,y)
                }

            }
            return result
        }

        function config(p,v,c,nxA,nyA,o,ss,pe){
            pos 				= p
            value 				= v
            color 				= c
            nx 					= nxA
            ny 					= nyA
            omega 				= o
            sorSource			= ss
            sorSource.onmessage = mHandle
            peer 				= pe
            //
            x 					= Math.floor(pos / ny)
            y 					= pos % ny
            omega_over_four 	= 0.25 *  omega
            one_minus_omega 	= 1.0 - omega
            neighbors 			= calcNeighbors()
        }

        function addMActor(mActor,pos){
            mActors[pos] = mActor
            mActor.onmessage = mHandle
        }

        function start(mi){
            expectingStart = false
            sorActors 		= mActors
            maxIter 		= mi
            if(color == 1){
                for(var i in neighbors){
                    sorActors[neighbors[i]].postMessage(["valueMessage",value])
                }
                iter   += 1
                msgRcv += 1
            }
            for(var i in pendingMessages){
                var lam = pendingMessages[i]
                lam()
            }
            pendingMessages = []
            mActors 		 = []
        }

        function valueMessage(val){
            if(expectingStart){
                pendingMessages.push(function(){valueMessage(val)})
            }
            else{
                msgRcv += 1
                if(iter < maxIter){
                    receivedVals += 1
                    sum += val
                    if(receivedVals == neighbors.length){
                        value 			= (omega_over_four * sum ) + (one_minus_omega * value)
                        sum 			= 0.0
                        receivedVals 	= 0
                        for(var i in neighbors){
                            sorActors[neighbors[i]].postMessage(["valueMessage",value])
                        }
                        iter 			+= 1
                    }
                    if(iter == maxIter){
                        sorSource.postMessage(["resultMessage",x,y,value,msgRcv])
                        self.postMessage(["actorExit"])
                    }
                }
            }
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2],event.data[3],event.data[4],event.data[5],event.data[6],event.ports[0],event.data[7])
                break;
            case "addMActor":
                addMActor(event.ports[0],event.data[1])
                break;
            case "start":
                start(event.data[1])
                break;
            case "valueMessage":
                valueMessage(event.data[1])
                break;
            case "link":
                link(event.ports[0])
                break;
            default :
                console.log("Unknown message (Actor): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}