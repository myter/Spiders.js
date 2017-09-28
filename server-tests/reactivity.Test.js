///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_chai_index.d.ts"/>
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_mocha_index.d.ts"/>
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var spider = require('../src/spiders');
var ps = require("../src/PubSub/PubSub");
class BasicSignal extends spider.Signal {
    constructor() {
        super();
        this.val = 1;
    }
    increment() {
        this.val++;
    }
}
__decorate([
    spider.mutator
], BasicSignal.prototype, "increment", null);
describe("Local Reactivity", () => {
    it("In main", function (done) {
        class TestApp extends spider.Application {
            constructor() {
                super();
                let sig = this.newSignal(BasicSignal);
                this.lift((v) => {
                    this.res = v.val;
                })(sig);
                sig.increment();
            }
        }
        let app = new TestApp();
        try {
            expect(app.res).to.equal(2);
            app.kill();
            done();
        }
        catch (e) {
            app.kill();
            done(e);
        }
    });
    it("In Actor", function (done) {
        class TestActor extends spider.Actor {
            constructor() {
                super();
                this.sigDef = BasicSignal;
            }
            init() {
                console.log(this.sigDef);
                let sig = this.newSignal(this.sigDef);
                this.lift((v) => {
                    console.log("Incremented");
                    this.res = v.val;
                })(sig);
                sig.increment();
            }
        }
        let app = new spider.Application();
        let act = app.spawnActor(TestActor);
        act.res.then((v) => {
            try {
                expect(v).to.equal(2);
                app.kill();
                done();
            }
            catch (e) {
                app.kill();
                done(e);
            }
        });
    });
});
//# sourceMappingURL=reactivity.Test.js.map