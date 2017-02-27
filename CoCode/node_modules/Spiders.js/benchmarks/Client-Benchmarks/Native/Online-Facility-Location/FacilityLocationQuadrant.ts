/**
 * Created by flo on 26/01/2017.
 */
module.exports = function(self){
    var parent = 				null
    var positionToParent = 		null
    var boundary =				null
    var threshold =				null
    var depth = 				null
    var initLocalFacilities = 	null
    var initKnownFacilities = 	null
    var initMaxDepthOpenFac = 	null
    var initCustomers =			null

    var facility = 				null
    var localFacilities = 		[]
    var supportCustomers = 		[]
    var knownFacilities = 		null
    var maxDepthOpenFac = 		null
    var terminatedChildCount = 	0
    var childrenFacilities = 	0
    var facilityCustomers = 	0
// null when closed, non-null when open
    var children = 				null
    var childrenBoundaries = 	null
    var childrenSpawned = 		0
    var totalCost = 			0.0

    function mHandle(event){
        function makePoint(xVal,yVal){
            return {
                x: xVal,
                y: yVal,
                getDistance: function(p){
                    var xDiff = p.x - this.x
                    var yDiff = p.y - this.y
                    var distance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))
                    return distance
                }
            }
        }

        function makeBoundary(bx1,by1,bx2,by2){
            return {
                x1: bx1,
                x2: bx2,
                y1: by1,
                y2: by2,
                midPoint: function(){
                    var xVal = (this.x1 + this.x2) / 2
                    var yVal = (this.y1 + this.y2) / 2
                    return makePoint(xVal,yVal)
                },
                contains: function(point){
                    return this.x1 <= point.x && this.y1 <= point.y && point.x <= this.x2 && point.y <= this.y2
                }
            }
        }

        function config(parentNull,par,ptp,bx1,by1,bx2,by2,thresh,d,ikf,imof){
            if(parentNull){
                parent = null
            }
            else {
                parent = par
                parent.onmessage = mHandle
            }
            positionToParent 		= ptp
            boundary 				= makeBoundary(bx1,by1,bx2,by2)
            threshold 				= thresh
            depth 					= d
            initKnownFacilities 	= ikf
            initMaxDepthOpenFac 	= imof
            initLocalFacilities 	= []
            initCustomers 			= []
            facility 				= boundary.midPoint()
            knownFacilities 		= ikf
            maxDepthOpenFac 		= imof
        }

        function copyInitFacility(xVal,yVal){
            var facility = makePoint(xVal,yVal)
            newInitFacility(facility)
        }

        function newInitFacility(facility){
            if(initLocalFacilities == null){
                var that = this
                setTimeout(function(){
                    that.newInitFacility(facility)
                },200)
            }
            else{
                initLocalFacilities.push(facility)
            }
        }

        function newInitCustomer(customer){
            var point = JSON.parse(customer)
            point = makePoint(point.x,point.y)
            if(initCustomers == null){
                var that = this
                setTimeout(function(){
                    that.newInitCustomer(customer)
                },200)
            }
            else{
                initCustomers.push(point)
            }
        }

        function configDone(expectReply,sender){
            //Could be that config isn't done yet (called by other actor for instance)
            if(initCustomers == null){
                var that = this
                setTimeout(function(){
                    that.configDone(expectReply,sender)
                },200)
            }
            else{
                self.postMessage(["actorInit"])
                initLocalFacilities.forEach((localFac)=> {
                    localFacilities.push(localFac)
                })
                localFacilities.push(facility)
                initCustomers.forEach((loopPoint)=> {
                    if(boundary.contains(loopPoint)){
                        addCustomer(loopPoint)
                    }
                })
            }
            if(expectReply){
                sender.postMessage(["childSpawned"])
            }
        }

        function addCustomer(point){
            supportCustomers.push(point)
            var minCost = findCost(point)
            totalCost += minCost
        }

        function findCost(point){
            var result = Infinity
            localFacilities.forEach((loopPoint) => {
                 var distance = loopPoint.getDistance(point)
                 if (distance < result) {
                 result = distance
                 }
             })
            return result
        }

        function childSpawned(){
            childrenSpawned += 1
            if(childrenSpawned == 4){
                supportCustomers = []
            }
        }

        function customerMsg(sender,pointString){
            var point = JSON.parse(pointString)
            point = makePoint(point.x,point.y)
            if(children == null){
                addCustomer(point)
                if(totalCost > threshold){
                    partition()
                }
            }
            else{
                if((childrenBoundaries.length == 4) && (childrenSpawned == 4)){
                    var index = 0
                    while(index <= 3){
                        var loopChildBoundary = childrenBoundaries[index]
                        if(loopChildBoundary.contains(point)){
                            var chan = new MessageChannel()
                            chan.port2.onmessage = mHandle
                            children[index].postMessage(["customerMsg",JSON.stringify(point)],[chan.port1])
                            index = 4
                        }
                        else{
                            index += 1
                        }
                    }
                }
                else{
                    setTimeout(function(){
                        customerMsg(sender,pointString)
                    },200)
                }
            }
            if(parent == null){
                sender.postMessage(["nextCustomerMsg"])
            }
        }

        function facilityMsg(posToParent,depth,pointString,bool){
            var point = JSON.parse(pointString)
            point = makePoint(point.x,point.y)
            knownFacilities += 1
            localFacilities.push(point)
            if(bool){
                notifyParentOfFacility(point,depth)
                if(depth > maxDepthOpenFac){
                    maxDepthOpenFac = depth
                }
                var childPos 	= posToParent
                var sibling 	= null
                if(childPos == "TOP_LEFT"){
                    sibling = children[3]
                }
                else if(childPos == "TOP_RIGHT"){
                    sibling = children[2]
                }
                else if(childPos == "BOT_RIGHT"){
                    sibling = children[0]
                }
                else {
                    sibling = children[1]
                }
                sibling.postMessage(["facilityMsg","UNKNOWN",depth,JSON.stringify(point),false])
            }
            else{
                if(children != null){
                    for(var i in children){
                        children[i].postMessage(["facilityMsg","UNKNOWN",depth,JSON.stringify(point),false])
                    }
                }
            }
        }

        function notifyParentOfFacility(point,depth){
            if(parent != null){
                parent.postMessage(["facilityMsg",positionToParent,depth,JSON.stringify(point),true])
            }
        }

        function childQuadSpawned(child,index){
            child.onmessage = mHandle
            for(var i in localFacilities){
                child.postMessage(["copyInitFacility",localFacilities[i].x,localFacilities[i].y])
            }
            for(var i in supportCustomers){
                child.postMessage(["newInitCustomer",JSON.stringify(supportCustomers[i])])
            }
            children[index] = child
            var bound = null
            if(index == 0){
                bound = makeBoundary(boundary.x1,facility.y,facility.x,boundary.y2)
            }
            else if(index == 1){
                bound = makeBoundary(facility.x,facility.y,boundary.x2,boundary.y2)
            }
            else if(index == 2){
                bound = makeBoundary(boundary.x1,boundary.y1,facility.x,facility.y)
            }
            else{
                bound = makeBoundary(facility.x,boundary.y1,boundary.x2,facility.y)
            }
            childrenBoundaries[index] = bound
            var c = new MessageChannel()
            c.port2.onmessage = mHandle
            child.postMessage(["configDone",true],[c.port1])
        }

        function partition(){
            children = []
            childrenBoundaries = []
            notifyParentOfFacility(facility,depth)
            maxDepthOpenFac 	= Math.max(maxDepthOpenFac,depth)
            var firstBoundary 		= makeBoundary(boundary.x1,facility.y,facility.x,boundary.y2)
            var secondBoundary 		= makeBoundary(facility.x,facility.y,boundary.x2,boundary.y2)
            var thirdBoundary 		= makeBoundary(boundary.x1,boundary.y1,facility.x,facility.y)
            var fourthBoundary 		= makeBoundary(facility.x,boundary.y1,boundary.x2,facility.y)
            var chan1 = new MessageChannel()
            chan1.port2.onmessage = mHandle
            self.postMessage(["spawnQuad",0,"TOP_LEFT",firstBoundary.x1,firstBoundary.y1,firstBoundary.x2,firstBoundary.y2,threshold,depth + 1,knownFacilities,maxDepthOpenFac],[chan1.port1])
            var chan2 = new MessageChannel()
            chan2.port2.onmessage = mHandle
            self.postMessage(["spawnQuad",1,"TOP_RIGHT",secondBoundary.x1,secondBoundary.y1,secondBoundary.x2,secondBoundary.y2,threshold,depth + 1,knownFacilities,maxDepthOpenFac],[chan2.port1])
            var chan3 = new MessageChannel()
            chan3.port2.onmessage = mHandle
            self.postMessage(["spawnQuad",2,"BOT_LEFT",thirdBoundary.x1,thirdBoundary.y1,thirdBoundary.x2,thirdBoundary.y2,threshold,depth + 1,knownFacilities,maxDepthOpenFac],[chan3.port1])
            var chan4 = new MessageChannel()
            chan4.port2.onmessage = mHandle
            self.postMessage(["spawnQuad",3,"BOT_RIGHT",fourthBoundary.x1,fourthBoundary.y1,fourthBoundary.x2,fourthBoundary.y2,threshold,depth + 1,knownFacilities,maxDepthOpenFac],[chan4.port1])
        }

        function requestExit(){
            if(children != null){
                for(var i in children){
                    children[i].postMessage(["requestExit"])
                }
            }
            else{
                safelyExit()
            }
        }

        function confirmExit(){
            terminatedChildCount += 1
            if(terminatedChildCount == 4){
                safelyExit()
            }
        }

        function safelyExit(){
            if(parent != null){
                var numFacilities = 0
                if(children != null){
                    numFacilities = childrenFacilities + 1
                }
                else{
                    numFacilities = childrenFacilities
                }
                var numCustomers = facilityCustomers + supportCustomers.length
                parent.postMessage(["confirmExit"])
            }
            else{
                var numFacilities = childrenFacilities + 1
            }
            self.postMessage(["actorExit"])
        }

        function link(ref){
            ref.onmessage = mHandle
        }

        switch(event.data[0]){
            case "config":
                if(event.data[1]){
                    config(event.data[1],null,event.data[2],event.data[3],event.data[4],event.data[5],event.data[6],event.data[7],event.data[8],event.data[9],event.data[10])

                }
                else{
                    config(event.data[1],event.ports[0],event.data[2],event.data[3],event.data[4],event.data[5],event.data[6],event.data[7],event.data[8],event.data[9],event.data[10])
                }
                break;
            case "copyInitFacility":
                copyInitFacility(event.data[1],event.data[2])
                break;
            case "newInitCustomer":
                newInitCustomer(event.data[1])
                break;
            case "configDone":
                configDone(event.data[1],event.ports[0])
                break;
            case "childSpawned":
                childSpawned()
                break;
            case "customerMsg":
                customerMsg(event.ports[0],event.data[1])
                break;
            case "facilityMsg":
                facilityMsg(event.data[1],event.data[2],event.data[3],event.data[4])
                break;
            case "childQuadSpawned":
                childQuadSpawned(event.ports[0],event.data[1])
                break;
            case "requestExit":
                requestExit()
                break;
            case "confirmExit":
                confirmExit()
                break;
            case "link":
                link(event.ports[0])
                break;
            default :
                console.log("Unknown message (Quad): " + event.data[0])

        }
    }
    self.addEventListener('message',mHandle)
}