/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var maxNodes = 			null
    var avgComp = 			null
    var stdComp = 			null
    var binomial = 			null
    var percent =			null
    var height =			1
    var size = 				1
    var children = 			[]
    var hasGrantChildren =	[]
    var traversed =			false
    var terminated =  		false
    var partId = 0

    function mHandle(event){
        function config(ms,ac,sc,bin,per){
            maxNodes 	= ms
            avgComp 	= ac
            stdComp 	= sc
            binomial	= bin
            percent		= per
            self.postMessage(["actorInit"])
        }

        function getNextNormal(avg,stdev){
            var result = 0
            while(result <= 0){
                var temp = Math.random() * ((100 - 0) + 0) * stdev + avg;
                result = Math.round(temp)
            }
            return result
        }

        function generateTree(){
            height += 1
            var compSize = getNextNormal(avgComp,stdComp)
            var i = 0
            while(i < binomial){
                hasGrantChildren[i] = false
                var c = new MessageChannel()
                c.port2.onmessage = mHandle
                self.postMessage(["spawnNodeP1",height,size + 1,compSize,false,partId],[c.port1])
                var c2 = new MessageChannel()
                c2.port2.onmessage = mHandle
                self.postMessage(["spawnNodeP2",partId],[c2.port1])
                partId += 1
                i += 1
            }
            size += binomial
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        function childSpawned(ref){
            children.push(ref)
        }

        function traverse(){
            for(var i in children){
                children[i].postMessage(["traverse"])
            }
        }

        function shouldGenerateChildren(childRef,childHeight){
            if(size + binomial <= maxNodes){
                var moreChildren = Math.floor(Math.random() * (2 - 0) + 0)
                if(moreChildren == 1){
                    var childComp = getNextNormal(avgComp,stdComp)
                    var randomInt = Math.floor(Math.random() * (100 - 0) + 0)
                    if(randomInt > percent){
                        childRef.postMessage(["generateChildren",size,childComp])
                    }
                    else{
                        childRef.postMessage(["generateUrgentChildren",Math.round(Math.random() * (binomial - 0) + 0),size,childComp])
                    }
                    size += binomial
                    if(childHeight + 1 > height){
                        height += childHeight + 1
                    }
                }
                else{
                    if(childHeight > height){
                        height = childHeight
                    }
                }
            }
            else{
                if(!traversed){
                    traversed = true
                    traverse()
                }
                terminate()
            }
        }

        function updateGrant(id){
            hasGrantChildren[id] = true
        }

        function terminate(){
            if(!terminated){
                for(var i in children){
                    children[i].postMessage(["terminate"])
                }
                self.postMessage(["endNode","root"])
                terminated = true
            }
        }

        switch(event.data[0]){
            case "config":
                config(event.data[1],event.data[2],event.data[3],event.data[4],event.data[5])
                break;
            case "generateTree":
                generateTree()
                break;
            case "link":
                link(event.ports[0])
                break;
            case "childSpawned":
                childSpawned(event.ports[0])
                break;
            case "traverse":
                traverse()
                break;
            case "shouldGenerateChildren":
                shouldGenerateChildren(event.ports[0],event.data[1])
                break;
            case "updateGrant":
                updateGrant(event.data[1])
                break;
            case "terminate":
                terminate()
                break;
            default :
                console.log("Unknown message (Root): " + event.data[0])
        }
    }
    self.addEventListener('message',mHandle)
}