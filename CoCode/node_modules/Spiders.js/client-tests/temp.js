/**
 * Created by flo on 19/01/2017.
 */
var spiders = require("../src/spiders")
var app = new spiders.Application()
class receivingActor extends spiders.Actor{
    getArray(sender,arr){
        arr.push(arr)
        sender.getBack(new this.ArrayIsolate(arr))
    }
}
class sendingActor extends spiders.Actor{
    send(ref){
        ref.getArray(this,new this.ArrayIsolate([1,2,3]))
    }
    getBack(arr){
        console.log(arr)
    }
}
var a1 = app.spawnActor(receivingActor)
var a2 = app.spawnActor(sendingActor)
a2.send(a1)


