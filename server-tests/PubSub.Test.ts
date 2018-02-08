/**
 * Created by flo on 23/03/2017.
 */
var chai                        = require('chai')
var expect                      = chai.expect
import {Actor,Application,SpiderIsolate} from "../src/spiders"

class TestServer extends Application{
    constructor(){
        super()
        this.libs.setupPSServer()
    }
}

describe("Publish Subscribe Functionality",() => {
    it("Each",function(done){
        let server = new TestServer()
        class TestClient extends Actor{
            psClient
            testTag
            init(){
                this.psClient = this.libs.setupPSClient()
                this.testTag = new this.libs.PubSubTag("test")
            }
            pub(){
                this.psClient.publish(5,this.testTag)
            }
            sub(){
                let resolve
                let prom = new Promise((res)=>{
                    resolve = res
                })
                this.psClient.subscribe(this.testTag).each((val)=>{
                    resolve(val)
                })
                return prom
            }
        }
        let puber = server.spawnActor(TestClient)
        let suber = server.spawnActor(TestClient)
        puber.pub()
        suber.sub().then((val)=>{
            try{
                expect(val).to.equal(5)
                server.kill()
                done()
            }
            catch(e){
                server.kill()
                done(e)
            }
        })
    })

    it("All",function(done){
        this.timeout(4000)
        let server = new TestServer()
        class TestClient extends Actor{
            client
            testTag
            subscription

            init(){
                this.client = this.libs.setupPSClient()
                this.testTag = new this.libs.PubSubTag("test")
            }
            pub(v){
                this.client.publish(v,this.testTag)
            }

            sub(){
                this.subscription = this.client.subscribe(this.testTag)
            }
        }
        let puber = server.spawnActor(TestClient)
        let suber = server.spawnActor(TestClient)
        puber.pub(5)
        puber.pub(10)
        suber.sub()
        setTimeout(()=>{
            suber.subscription.then((subRef)=>{
                subRef.all().then((arr)=>{
                    try{
                        expect(arr[0]).to.equal(5)
                        expect(arr[1]).to.equal(10)
                        server.kill()
                        done()
                    }
                    catch(e){
                        server.kill()
                        done(e)
                    }
                })
            })
        },2000)
    })
})

describe("Publish Objects",()=>{
    it("Far ref",function(done){
        let server = new TestServer()
        class TestClient extends Actor{
            client
            testTag

            init(){
                this.client = this.libs.setupPSClient()
                this.testTag = new this.libs.PubSubTag("test")
            }
            pub(){
                this.client.publish({x: 5},this.testTag)
            }

            sub(){
                let resolve
                let prom = new Promise((res)=>{
                    resolve = res
                })
                this.client.subscribe(this.testTag).each((ref)=>{
                    ref.x.then((v)=>{
                        resolve(v)
                    })
                })
                return prom
            }
        }
        let puber = server.spawnActor(TestClient)
        let suber = server.spawnActor(TestClient)
        puber.pub()
        suber.sub().then((val)=>{
            try{
                expect(val).to.equal(5)
                server.kill()
                done()
            }
            catch(e){
                server.kill()
                done(e)
            }
        })
    })

    it("Isolate",function(done) {
        let server = new TestServer()
        class TestIsolate extends SpiderIsolate {
            val

            constructor(v) {
                super()
                this.val = v
            }
        }
        class TestClient extends Actor {
            testTag
            TestIsolate
            client

            constructor() {
                super()
                this.TestIsolate = TestIsolate
            }

            init(){
                this.client = this.libs.setupPSClient()
                this.testTag = new this.libs.PubSubTag("test")
            }

            pub() {
                this.client.publish(new this.TestIsolate(5), this.testTag)
            }

            sub() {
                let resolve
                let prom = new Promise((res) => {
                    resolve = res
                })
                this.client.subscribe(this.testTag).each((isol) => {
                    resolve(isol.val)
                })
                return prom
            }
        }
        let puber = server.spawnActor(TestClient)
        let suber = server.spawnActor(TestClient)
        puber.pub()
        suber.sub().then((val) => {
            try {
                expect(val).to.equal(5)
                server.kill()
                done()
            }
            catch (e) {
                server.kill()
                done(e)
            }
        })
    })
})