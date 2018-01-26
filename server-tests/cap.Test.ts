import {SpiderLib} from "../src/spiders";
import {Eventual} from "../src/Onward/Eventual";
import {CAPActor} from "../src/Onward/CAPActor";

var assert                      = require('assert')
var chai                        = require('chai')
var expect                      = chai.expect
var spider  : SpiderLib         = require('../src/spiders')

describe("Eventuals",()=>{
    class TestEventual extends Eventual{
        v1

        constructor(){
            super()
            this.v1 = 5
        }

        inc(){
            this.v1++
        }
    }

    it("Class Serialisation",(done)=>{
        class Act extends spider.Actor{
            TestEventual
            constructor(){
                super()
                this.TestEventual = TestEventual
            }
            test(){
                let ev = new this.TestEventual()
                return ev.v1
            }
        }
        let app = new spider.Application()
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v).to.equal(5)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Eventual Serialisation",function(done){
        class Act2 extends spider.Actor{
            ev
            constructor(){
                super()
                this.ev = new TestEventual()
            }

            test(){
                return 5
            }
        }
        let app = new spider.Application()
        app.spawnActor(Act2).test().then((v)=>{
            try{
                expect(v).to.equal(5)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Simple Replication, master change",function(done){
        this.timeout(4000)
        let app = new spider.Application()
        class Master extends CAPActor{
            ev
            constructor(){
                super()
                this.ev = new TestEventual()
            }

            sendAndInc(toRef){
                toRef.getEv(this.ev)
                this.ev.inc()
            }
        }
        class Slave extends CAPActor{
            ev
            getEv(anEv){
              this.ev = anEv
            }
            test(){
                return new Promise((resolve)=>{
                    setTimeout(()=>{
                        resolve(this.ev.v1)
                    },2000)
                })
            }
        }
        let slave = app.spawnActor(Slave)
        let master = app.spawnActor(Master)
        master.sendAndInc(slave)
        slave.test().then((v)=>{
            try{
                expect(v).to.equal(6)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Simple Replication, slave change",function(done){
        this.timeout(4000)
        let app = new spider.Application()
        class Master extends CAPActor{
            ev
            constructor(){
                super()
                this.ev = new TestEventual()
            }

            send(toRef){
                toRef.getEv(this.ev)
            }

            test(){
                return new Promise((resolve)=>{
                    setTimeout(()=>{
                        resolve(this.ev.v1)
                    },2000)
                })
            }
        }
        class Slave extends CAPActor{
            getEv(anEv){
                anEv.inc()

            }
        }
        let slave = app.spawnActor(Slave)
        let master = app.spawnActor(Master)
        master.send(slave)
        master.test().then((v)=>{
            try{
                expect(v).to.equal(6)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    //TODO test "constraints" (can only be done once other have been implemented as well)
})

describe("Consistents",()=>{

})

describe("Availables",()=>{

})