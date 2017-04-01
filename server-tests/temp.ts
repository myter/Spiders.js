import {SpiderLib} from "../src/spiders";
var spiders : SpiderLib = require("../src/spiders")

/*class TestObject{
    x
    constructor(){
        this.x = 1
    }

    inc(){
        this.x += 1
    }
}

class TestRepliq extends spiders.Repliq{
    objectField

    constructor(){
        super()
        this.objectField = new TestObject()
    }

    update(){
        this.objectField.inc()
    }
}

class TestApp extends spiders.Application{
    myReplica
    constructor(){
        super()
        this.myReplica = this.newRepliq(TestRepliq)
    }
}

class TestActor extends spiders.Actor{
    myReplica
    getReplica(rep){
        this.myReplica = rep
        this.myReplica.update().onceCommited(()=>{
            console.log("Update commited ! ")
            console.log("Value in child: " + this.myReplica.objectField.x)
        })
    }
}

var app = new TestApp()
var act = app.spawnActor(TestActor)
act.getReplica(app.myReplica)
setTimeout(()=>{
    console.log("Value in app: " + app.myReplica.objectField.x)
},2000)*/

class InnerRepliq extends spiders.Repliq{
    someInnerField
    constructor(){
        super()
        this.someInnerField = 5
    }

    incInner(){
        this.someInnerField = 6
    }
}

class TestRepliq extends spiders.Repliq{
    someOuterField
    inner

    constructor(creator){
        super()
        this.someOuterField = 5
        this.inner = creator.newRepliq(InnerRepliq)
    }

    incOuter(){
        this.someOuterField = 6
    }

    incAll(){
        this.incOuter()
        this.inner.incInner()
    }
}

class TestApp extends spiders.Application{
    myReplica
    constructor(){
        super()
        this.myReplica = this.newRepliq(TestRepliq,this)
    }
}
class TestActor extends spiders.Actor{
    getAndUpdate(rep){
        //TODO doesn't return a once commited object ??
        /*rep.incAll().onceCommited(()=>{
            console.log("Value after commit in actor: " + rep.someOuterField + " , " + rep.inner.someInnerField)
        })*/
        rep.incAll()
        setTimeout(()=>{
            console.log("Value after commit in actor: " + rep.someOuterField + " , " + rep.inner.someInnerField)
        },4000)
    }
}
var app = new TestApp()
var act = app.spawnActor(TestActor)
act.getAndUpdate(app.myReplica)
setTimeout(()=>{
    console.log("Value after: " + app.myReplica.someOuterField + " , " + app.myReplica.inner.someInnerField)
},2000)
/*console.log("Outer val before: " + app.myReplica.someOuterField)
console.log("Inner val before: " + app.myReplica.inner.someInnerField)
app.myReplica.incAll()
console.log("Outer val after: " + app.myReplica.someOuterField)
console.log("Inner val after: " + app.myReplica.inner.someInnerField)*/