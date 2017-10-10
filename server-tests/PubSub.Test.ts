/**
 * Created by flo on 23/03/2017.
 */
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_chai_index.d.ts"/>
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_mocha_index.d.ts"/>


import {SpiderLib} from "../src/spiders";

/**
 * Created by flo on 20/03/2017.
 */
var chai                        = require('chai')
var expect                      = chai.expect
var spider  : SpiderLib         = require('../src/spiders')

class TestServer extends spider.Application{
    constructor(){
        super()
        this.PSServer()
    }
}

describe("Publish Subscribe Functionality",() => {
    it("Each",function(done){
        let server = new TestServer()
        class TestClient extends spider.Actor{
            testTag

            /*constructor(){
                super()
                this.testTag = new ps.PubSubTag("test")
            }*/

            init(){
                this.testTag = this.newPSTag("test")
                this.PSClient()
            }
            pub(){
                this.publish(5,this.testTag)
            }

            sub(){
                let resolve
                let prom = new Promise((res)=>{
                    resolve = res
                })
                this.subscribe(this.testTag).each((val)=>{
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
        class TestClient extends spider.Actor{
            testTag
            subscription

            init(){
                this.PSClient()
                this.testTag = this.newPSTag("test")
            }
            pub(v){
                this.publish(v,this.testTag)
            }

            sub(){
                this.subscription = this.subscribe(this.testTag)
            }
        }
        let puber = server.spawnActor(TestClient)
        let suber = server.spawnActor(TestClient)
        puber.pub(5)
        puber.pub(10)
        suber.sub()
        setTimeout(()=>{
          suber.subscription.then((subRef)=>{
              let arr = subRef.all()
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
        },2000)
    })
})

describe("Publish Objects",()=>{
    it("Far ref",function(done){
        let server = new TestServer()
        class TestClient extends spider.Actor{
            testTag

            init(){
                this.PSClient()
                this.testTag = this.newPSTag("test")
            }
            pub(){
                this.publish({x: 5},this.testTag)
            }

            sub(){
                let resolve
                let prom = new Promise((res)=>{
                    resolve = res
                })
                this.subscribe(this.testTag).each((ref)=>{
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
        class TestIsolate extends spider.Isolate {
            val

            constructor(v) {
                super()
                this.val = v
            }
        }
        class TestClient extends spider.Actor {
            testTag
            TestIsolate

            constructor() {
                super()
                this.TestIsolate = TestIsolate
            }

            init(){
                this.PSClient()
                this.testTag = this.newPSTag("test")
            }

            pub() {
                this.publish(new this.TestIsolate(5), this.testTag)
            }

            sub() {
                let resolve
                let prom = new Promise((res) => {
                    resolve = res
                })
                this.subscribe(this.testTag).each((isol) => {
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

        it("Replica",function(done){
            this.timeout(10000)
            let server = new TestServer()
            class TestReplica extends spider.Repliq{
                val
                constructor(){
                    super()
                    this.val = 1
                }

                update(v){
                    this.val = v
                }

            }
            class TestClient extends spider.Actor{
                testTag
                TestReplica
                myReplica
                constructor(){
                    super()
                    this.TestReplica = TestReplica
                }
                init(){
                    this.PSClient()
                    this.testTag = this.newPSTag("test")
                }
                pub(){
                    this.myReplica = this.newRepliq(this.TestReplica)
                    this.publish(this.myReplica,this.testTag)
                }

                sub(){
                    let resolve
                    let prom = new Promise((res)=>{
                        resolve = res
                    })
                    this.subscribe(this.testTag).each((rep)=>{
                        rep.update(5).onceCommited(()=>{
                            resolve(rep.val.valueOf())
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
})