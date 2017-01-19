/**
 * Created by flo on 10/01/2017.
 */
var spider = require('../src/spiders')
class testApp extends spider.Application{

}
var app = new testApp()
class testActor1 extends app.Actor{
    getAndAccess(){
        return remote("127.0.0.1",8082).then((ref) => {
            console.log("Calling getval")
            return ref.getVal()
        })
    }
}
class testActor2 extends app.Actor{
    getVal(){
        return 5
    }
}
var actor  = app.spawnActor(testActor1)
app.spawnActor(testActor2,[],8082)
actor.getAndAccess().then((v) => {
    console.log("Got : " + v)
})