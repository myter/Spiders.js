///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_chai_index.d.ts"/>
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_mocha_index.d.ts"/>


import {SpiderLib} from "../src/spiders";
import {PubSubLib} from "../src/PubSub/PubSub";



var assert                      = require('assert')
var chai                        = require('chai')
var expect                      = chai.expect
var spider  : SpiderLib         = require('../src/spiders')
var ps      : PubSubLib         = require("../src/PubSub/PubSub")

class BasicSignal extends spider.Signal{
    val

    constructor(){
        super()
        this.val = 1
    }

    @spider.mutator
    increment(){
        this.val++
    }

}

describe("Local Reactivity",()=>{
    it("In main",function(done){
        class TestApp extends spider.Application{
            res
            constructor(){
                super()
                let sig : any = this.newSignal(BasicSignal)
                this.lift((v)=>{
                    this.res = v.val
                })(sig)
                sig.increment()
            }
        }
        let app = new TestApp()
        try{
            expect(app.res).to.equal(2)
            app.kill()
            done()
        }
        catch(e){
            app.kill()
            done(e)
        }
    })

    it("In Actor",function(done){
        class TestActor extends spider.Actor{
            sigDef
            res

            constructor(){
                super()
                this.sigDef = BasicSignal
            }

            init(){
                console.log(this.sigDef)
                let sig : any = this.newSignal(this.sigDef)
                this.lift((v)=>{
                    console.log("Incremented")
                    this.res = v.val
                })(sig)
                sig.increment()
            }
        }

        let app = new spider.Application()
        let act = app.spawnActor(TestActor)
        act.res.then((v)=>{
            try{
                expect(v).to.equal(2)
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