import {PSClient} from "./PubSub/SubClient";
import {ActorEnvironment} from "./ActorEnvironment";
import {PSServer} from "./PubSub/SubServer";
import {PubSubTag} from "./PubSub/SubTag";
import {FarRef} from "spiders.js";
import {SpiderActorMirror} from "./MAP";
import {SpiderObject, SpiderObjectMirror} from "./MOP";

class BufferedMirror extends SpiderObjectMirror{
    buffer : Array<Function>

    constructor(){
        super()
        this.buffer = []
    }

    access(fieldName){
        let base = this.base as BufferedRef
        if(base.isConnected){
            return base.realRef[fieldName]
        }
        else{
            var that = this
            let ret = function(... args){
                return new Promise((resolve)=>{
                    that.buffer.push(()=>{
                        resolve(base.realRef[fieldName](args))
                    })
                })
            }
            let resolver
            let p = new Promise((res)=>{
                resolver = res
            })
            ret["then"]     = function(resolve,reject){
                return p.then(resolve,reject)
            }
            ret["catch"]    = function(reject){
                return p.catch(reject)
            }
            this.buffer.push(()=>{
                resolver(base.realRef[fieldName])
            })
            return ret
        }
    }

    invoke(methodName,args){
        if(methodName == "_connected_"){
            super.invoke(methodName,args)
        }
        else{
            let base = this.base as BufferedRef
            if(base.isConnected){
                return base.realRef[methodName](args)
            }
            else{
                return new Promise((resolve)=>{
                    this.buffer.push(()=>{
                        resolve(base.realRef[methodName](args))
                    })
                })
            }
        }
    }

    gotConnected(){
        this.buffer.forEach((f)=>{
            f()
        })
    }
}

class BufferedRef extends SpiderObject{
    realRef
    isConnected
    thisMirror

    constructor(){
        let m               = new BufferedMirror()
        super(m)
        this.thisMirror     = m
        this.isConnected    = false
    }
    _connected_(realRef){
        this.isConnected    = true
        this.realRef        = realRef
        this.thisMirror.gotConnected()
    }
}

export class ActorSTDLib{
    environment : ActorEnvironment
    PubSubTag   : {new(tagVal : string) : PubSubTag}
    constructor(env){
        this.environment = env
        this.PubSubTag   = PubSubTag
    }

    setupPSClient(address : string = "127.0.0.1",port : number = 8000) : PSClient{
        return new PSClient(this.environment.behaviourObject,address,port)
    }

    setupPSServer(){
        this.environment.behaviourObject["_PS_SERVER_"] = new PSServer()
    }

    remote(address : string,port : number) : Promise<FarRef>{
        return this.environment.commMedium.connectRemote(this.environment.thisRef,address,port,this.environment.promisePool)
    }

    buffRemote(address : string,port : number) : FarRef{
        let ref = new BufferedRef()
        this.environment.commMedium.connectRemote(this.environment.thisRef,address,port,this.environment.promisePool).then((realRef)=>{
            ref._connected_(realRef)
        })
        return ref
    }

    reflectOnActor() : SpiderActorMirror{
        return this.environment.actorMirror
    }

    reflectOnObject(object : any) : SpiderObjectMirror{
        return object[SpiderObjectMirror.mirrorAccessKey]
    }

    serveApp(pathToHtml : string,pathToClientScript : string,bundleName : string,httpPort : number){
        var express     = require('express');
        let path        = require('path')
        let resolve     = path.resolve
        var app         = express();
        var http        = require('http').Server(app)
        //app.engine('html', require('ejs').renderFile)
        //app.set('view engine', 'ejs')
        app.get('/', (req, res) =>{
            res.sendFile(resolve(pathToHtml))
            //res.render(resolve(pathToHtml),{test: "foo"})
        });
        let htmlDir     = path.dirname(resolve(pathToHtml))
        let bundlePath  = htmlDir+"/"+bundleName
        app.get("/"+bundleName,(req,res)=>{
            res.sendFile(bundlePath)
        })
        let execSync = require('child_process').execSync;
        execSync("browserify " + resolve(pathToClientScript) + " -o " + bundlePath);
        http.listen(httpPort)
    }
}