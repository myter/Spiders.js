Object.defineProperty(exports, "__esModule", { value: true });
const SubClient_1 = require("./PubSub/SubClient");
const SubServer_1 = require("./PubSub/SubServer");
const SubTag_1 = require("./PubSub/SubTag");
const MOP_1 = require("./MOP");
class BufferedMirror extends MOP_1.SpiderObjectMirror {
    constructor() {
        super();
        this.buffer = [];
    }
    access(fieldName) {
        let base = this.base;
        if (base.isConnected) {
            return base.realRef[fieldName];
        }
        else {
            var that = this;
            let ret = function (...args) {
                return new Promise((resolve) => {
                    that.buffer.push(() => {
                        resolve(base.realRef[fieldName](args));
                    });
                });
            };
            let resolver;
            let p = new Promise((res) => {
                resolver = res;
            });
            ret["then"] = function (resolve, reject) {
                return p.then(resolve, reject);
            };
            ret["catch"] = function (reject) {
                return p.catch(reject);
            };
            this.buffer.push(() => {
                resolver(base.realRef[fieldName]);
            });
            return ret;
        }
    }
    invoke(methodName, args) {
        if (methodName == "_connected_") {
            super.invoke(methodName, args);
        }
        else {
            let base = this.base;
            if (base.isConnected) {
                return base.realRef[methodName](args);
            }
            else {
                return new Promise((resolve) => {
                    this.buffer.push(() => {
                        resolve(base.realRef[methodName](args));
                    });
                });
            }
        }
    }
    gotConnected() {
        this.buffer.forEach((f) => {
            f();
        });
    }
}
class BufferedRef extends MOP_1.SpiderObject {
    constructor() {
        let m = new BufferedMirror();
        super(m);
        this.thisMirror = m;
        this.isConnected = false;
    }
    _connected_(realRef) {
        this.isConnected = true;
        this.realRef = realRef;
        this.thisMirror.gotConnected();
    }
}
class ActorSTDLib {
    constructor(env) {
        this.environment = env;
        this.PubSubTag = SubTag_1.PubSubTag;
    }
    setupPSClient(address = "127.0.0.1", port = 8000) {
        return new SubClient_1.PSClient(this.environment.behaviourObject, address, port);
    }
    setupPSServer() {
        this.environment.behaviourObject["_PS_SERVER_"] = new SubServer_1.PSServer();
    }
    remote(address, port) {
        return this.environment.commMedium.connectRemote(this.environment.thisRef, address, port, this.environment.promisePool);
    }
    buffRemote(address, port) {
        let ref = new BufferedRef();
        this.environment.commMedium.connectRemote(this.environment.thisRef, address, port, this.environment.promisePool).then((realRef) => {
            ref._connected_(realRef);
        });
        return ref;
    }
    reflectOnActor() {
        return this.environment.actorMirror;
    }
    reflectOnObject(object) {
        return object[MOP_1.SpiderObjectMirror.mirrorAccessKey];
    }
    serveApp(pathToHtml, pathToClientScript, bundleName, httpPort) {
        var express = require('express');
        let path = require('path');
        let resolve = path.resolve;
        var app = express();
        var http = require('http').Server(app);
        //app.engine('html', require('ejs').renderFile)
        //app.set('view engine', 'ejs')
        app.get('/', (req, res) => {
            res.sendFile(resolve(pathToHtml));
            //res.render(resolve(pathToHtml),{test: "foo"})
        });
        let htmlDir = path.dirname(resolve(pathToHtml));
        let bundlePath = htmlDir + "/" + bundleName;
        app.get("/" + bundleName, (req, res) => {
            res.sendFile(bundlePath);
        });
        let execSync = require('child_process').execSync;
        execSync("browserify " + resolve(pathToClientScript) + " -o " + bundlePath);
        http.listen(httpPort);
    }
}
exports.ActorSTDLib = ActorSTDLib;
//# sourceMappingURL=ActorSTDLib.js.map