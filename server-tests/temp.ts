import {SpiderIsolate,Actor,Application} from "../src/spiders"

class TestAvailable extends SpiderIsolate{
    someVal
    constructor(){
        super()
        this.someVal = 5
    }
}

class Act extends Actor{
    TestAvailable
    av
    thisDir
    constructor(){
        super()
        this.thisDir = __dirname
        this.av             = new TestAvailable()
        this.TestAvailable  = TestAvailable
    }

    test(){
        let av = new this.TestAvailable()
        av.someVal = 555
        return av.someVal
    }
}
let app = new Application()
app.spawnActor(Act).test().then((v)=>{
    console.log("Got back:  " + v)
})
