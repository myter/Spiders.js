import {Eventual} from "../src/Onward/Eventual";
import {CAPActor} from "../src/Onward/CAPActor";
import {Consistent} from "../src/Onward/Consistent";
import {Available} from "../src/Onward/Available";
import {Application,Actor} from "../src/spiders"

var assert                      = require('assert')
var chai                        = require('chai')
var expect                      = chai.expect

describe("Availables",()=>{
    class TestAvailable extends Available{
        value
        constructor(){
            super()
            this.value = 5
        }

        incWithPrim(num){
            this.value += num
        }

        incWithCon(con){
            this.value += con.value
        }
    }

    it("Check OK Constraint (primitive)",(done)=>{
        let app = new Application()
        class Act extends Actor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestAvailable
            }

            test(){
                let c = new this.TestConsistent()
                c.incWithPrim(5)
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check OK Constraint (Available)",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestAvailable
            }

            test(){
                let c   = new this.TestConsistent()
                let cc  = new this.TestConsistent()
                c.incWithCon(cc)
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check OK Constraint (Eventual)",(done)=>{
        let app = new Application()
        class TestEventual extends Eventual{
            value
            constructor(){
                super()
                this.value  = 5
            }
        }
        class Act extends CAPActor{
            TestConsistent
            TestEventual
            constructor(){
                super()
                this.TestConsistent = TestAvailable
                this.TestEventual   = TestEventual
            }

            test(){
                let c   = new this.TestConsistent()
                let cc  = new this.TestEventual()
                c.incWithCon(cc)
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check OK Assignment (primitive)",(done)=>{
        let app = new Application()
        class Act extends Actor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestAvailable
            }

            test(){
                let c = new this.TestConsistent()
                c.value = 6
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
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

    it("Check OK Assignment (Available)",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestAvailable
            }

            test(){
                let c   = new this.TestConsistent()
                let cc  = new this.TestConsistent()
                c.value = cc
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v.value).to.equal(5)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check OK Assignment (Eventual)",(done)=>{
        let app = new Application()
        class TestEventual extends Eventual{
            value
            constructor(){
                super()
                this.value  = 5
            }
        }
        class Act extends CAPActor{
            TestConsistent
            TestEventual
            constructor(){
                super()
                this.TestConsistent = TestAvailable
                this.TestEventual   = TestEventual
            }

            test(){
                let c   = new this.TestConsistent()
                let cc  = new this.TestEventual()
                c.value = cc
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v.value).to.equal(5)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check NOK Constraint",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestAvailable
            }

            test(){
                let c   = new this.TestConsistent()
                c.incWithCon({value:5})
                return c.value
            }
        }
        app.spawnActor(Act).test().catch(()=>{
            app.kill()
            done()
        })
    })

    it("Check NOK Assignment",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestAvailable
            }

            test(){
                let c   = new this.TestConsistent()
                c.value = {x:5}
                return c.value
            }
        }
        app.spawnActor(Act).test().catch(()=>{
            app.kill()
            done()
        })
    })

    it("Class serialisation",(done)=>{
        class Act extends Actor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestAvailable
            }
            test(){
                let c = new this.TestConsistent()
                return c.value
            }
        }
        let app = new Application()
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

    it("Consistent Serialisation",(done)=>{
        class Act2 extends CAPActor{
            c
            constructor(){
                super()
                this.c = new TestAvailable()
            }

            test(){
                return this.c.value
            }
        }
        let app = new Application()
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
})

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

        incWithPrim(v){
            this.v1 += v
        }

        incWithCon(c){
            this.v1 += c.v1
        }
    }

    it("Check OK Constraint (primitive)",(done)=>{
        let app = new Application()
        class Act extends Actor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestEventual
            }

            test(){
                let c = new this.TestConsistent()
                c.incWithPrim(5)
                return c.v1
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check OK Constraint (Eventual)",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestEventual
            }

            test(){
                let c   = new this.TestConsistent()
                let cc  = new this.TestConsistent()
                c.incWithCon(cc)
                return c.v1
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check OK Assignment (primitive)",(done)=>{
        let app = new Application()
        class Act extends Actor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestEventual
            }

            test(){
                let c = new this.TestConsistent()
                c.v1 = 6
                return c.v1
            }
        }
        app.spawnActor(Act).test().then((v)=>{
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

    it("Check OK Assignment (Eventual)",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestEventual
            }

            test(){
                let c   = new this.TestConsistent()
                let cc  = new this.TestConsistent()
                c.v1 = cc
                return c.v1
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v.v1).to.equal(5)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check NOK Constraint",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestEventual
            }

            test(){
                let c   = new this.TestConsistent()
                c.incWithCon({value:5})
                return c.value
            }
        }
        app.spawnActor(Act).test().catch(()=>{
            app.kill()
            done()
        })
    })

    it("Check NOK Assignment",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestEventual
            }

            test(){
                let c   = new this.TestConsistent()
                c.v1 = {x:5}
                return c.value
            }
        }
        app.spawnActor(Act).test().catch(()=>{
            app.kill()
            done()
        })
    })

    it("Class Serialisation",(done)=>{
        class Act extends Actor{
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
        let app = new Application()
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
        class Act2 extends Actor{
            ev
            constructor(){
                super()
                this.ev = new TestEventual()
            }

            test(){
                return this.ev.v1
            }
        }
        let app = new Application()
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
        let app = new Application()
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
        let app = new Application()
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
})

describe("Consistents",()=>{
    class TestConsistent extends Consistent{
        value
        constructor(){
            super()
            this.value = 5
        }

        incWithPrim(num){
            this.value += num
        }

        incWithCon(con){
            this.value += con.value
        }
    }

    it("Check OK Constraint (primitive)",(done)=>{
        let app = new Application()
        class Act extends Actor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestConsistent
            }

            test(){
                let c = new this.TestConsistent()
                c.incWithPrim(5)
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check OK Constraint (Consistent)",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestConsistent
            }

            test(){
                let c   = new this.TestConsistent()
                let cc  = new this.TestConsistent()
                c.incWithCon(cc)
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            try{
                expect(v).to.equal(10)
                app.kill()
                done()
            }
            catch(e){
                app.kill()
                done(e)
            }
        })
    })

    it("Check OK Assignment (primitive)",(done)=>{
        let app = new Application()
        class Act extends Actor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestConsistent
            }

            test(){
                let c = new this.TestConsistent()
                c.value = 6
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
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

    it("Check OK Assignment (Consistent)",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestConsistent
            }

            test(){
                let c   = new this.TestConsistent()
                let cc  = new this.TestConsistent()
                c.value = cc
                return c.value
            }
        }
        app.spawnActor(Act).test().then((v)=>{
            v.value.then((vv)=>{
                try{
                    expect(vv).to.equal(5)
                    app.kill()
                    done()
                }
                catch(e){
                    app.kill()
                    done(e)
                }
            })
        })
    })

    it("Check NOK Constraint",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestConsistent
            }

            test(){
                let c   = new this.TestConsistent()
                c.incWithCon({value:5})
                return c.value
            }
        }
        app.spawnActor(Act).test().catch(()=>{
            app.kill()
            done()
        })
    })

    it("Check NOK Assignment",(done)=>{
        let app = new Application()
        class Act extends CAPActor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestConsistent
            }

            test(){
                let c   = new this.TestConsistent()
                c.value = {x:5}
                return c.value
            }
        }
        app.spawnActor(Act).test().catch(()=>{
            app.kill()
            done()
        })
    })

    it("Class serialisation",(done)=>{
        class Act extends Actor{
            TestConsistent
            constructor(){
                super()
                this.TestConsistent = TestConsistent
            }
            test(){
                let c = new this.TestConsistent()
                return c.value
            }
        }
        let app = new Application()
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

    it("Consistent Serialisation",(done)=>{
        class Act2 extends CAPActor{
            c
            constructor(){
                super()
                this.c = new TestConsistent()
            }

            test(){
                return this.c.value
            }
        }
        let app = new Application()
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
})

