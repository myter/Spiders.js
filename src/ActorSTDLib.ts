import {PSClient} from "./PubSub/SubClient";
import {ActorEnvironment} from "./ActorEnvironment";
import {PSServer} from "./PubSub/SubServer";
import {PubSubTag} from "./PubSub/SubTag";
import {SpiderActorMirror} from "./MAP";
import {SpiderIsolate, SpiderObject, SpiderObjectMirror} from "./MOP";
import {deserialise,serialise} from "./serialisation";

type FarRef<T> = any

class BufferedMirror extends SpiderObjectMirror{
    buffer : Array<Function>

    constructor(){
        super()
        this.buffer = []
    }

    access(fieldName){
        let base = this.base as BufferedRef
        if(fieldName == "thisMirror"){
            return base.thisMirror
        }
        else if(base.isConnected){
            return base.realRef[fieldName]
        }
        else{
            var that = this
            let ret = function(... args){
                return new Promise((resolve)=>{
                    that.buffer.push(()=>{
                        resolve(base.realRef[fieldName](...args))
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
                return base.realRef[methodName](...args)
            }
            else{
                return new Promise((resolve)=>{
                    this.buffer.push(()=>{
                        resolve(base.realRef[methodName](...args))
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

export interface WebAppOptions{
    publicResourceURL?      : string
    pathToPublicResource?   : string
    globalVarMappings?      : Map<string,any>
}


export class ActorSTDLib{
    environment : ActorEnvironment
    PubSubTag   : {new(tagVal : string) : PubSubTag}

    constructor(env){
        this.environment = env
        this.PubSubTag   = PubSubTag
    }

    clone(toClone){
        let serialised = serialise(toClone,null,this.environment)
        return deserialise(serialised,this.environment)
    }

    setupPSClient(address : string = "127.0.0.1",port : number = 8000) : PSClient{
        return new PSClient(this.environment.behaviourObject,address,port)
    }

    setupPSServer(){
        this.environment.behaviourObject["_PS_SERVER_"] = new PSServer()
    }

    remote(address : string,port : number) : Promise<FarRef<any>>{
        return this.environment.commMedium.connectRemote(address,port)
    }

    buffRemote(address : string,port : number) : FarRef<any>{
        let ref = new BufferedRef()
        this.environment.commMedium.connectRemote(address,port).then((realRef)=>{
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

    serveApp(pathToHtml : string,pathToClientScript : string,httpPort : number,options? : WebAppOptions) : Promise<any>{
        return new Promise((res,reject)=>{
            var express         = require('express');
            let path            = require('path')
            let resolve         = path.resolve
            var app             = express();
            var http            = require('http').Server(app)
            if(options && options.publicResourceURL){
                app.use(options.publicResourceURL,express.static(resolve(options.pathToPublicResource)))
            }
            let outHTMLParse    = path.parse(pathToHtml)
            let outputHtml      = outHTMLParse.dir+ "/"+ outHTMLParse.name + "Modified"+outHTMLParse.ext
            app.get('/', (req, res) =>{
                res.sendFile(resolve(outputHtml))
            });
            let htmlDir         = path.dirname(resolve(pathToHtml))
            let bundleName      = path.parse(pathToClientScript).name+"bundle.js"
            let bundlePath      = htmlDir+"/"+bundleName
            app.get("/"+bundleName,(req,res)=>{
                res.sendFile(bundlePath)
            })
            let fs              = require('fs')
            var bundleFs        = fs.createWriteStream(bundlePath);
            var browserify      = require('browserify');
            let reader          = browserify(resolve(pathToClientScript)).bundle()
            reader.pipe(bundleFs)
            reader.on('end',()=>{
                var jsdom       = require("jsdom").JSDOM
                var htmlSource  = fs.readFileSync(pathToHtml, "utf8")
                var window      = new jsdom(htmlSource).window
                var $           = require('jquery')(window)
                let htmlFolder  = path.parse(pathToHtml).dir
                if(options && options.globalVarMappings){
                    let varDefs = ''
                    options.globalVarMappings.forEach((value : any,key : string)=>{
                        if(typeof value == "string"){
                            varDefs += "var " + key + " = " + '"' +value+ '"' + ";";
                        }
                        else{
                            varDefs += "var " + key + " = " + value + ";";
                        }
                    })
                    $('head').append('<script>' + varDefs +  '</script>')
                }
                $('<script>').appendTo($('body')).attr('src',htmlFolder+"/"+bundleName);
                fs.writeFile(outputHtml, window.document.documentElement.outerHTML,
                    function (error){
                        if (error){
                            reject(error)
                        }
                        else{
                            http.listen(httpPort)
                            res()
                        }
                });
            })
        })
    }
}