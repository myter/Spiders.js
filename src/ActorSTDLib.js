Object.defineProperty(exports, "__esModule", { value: true });
const SubClient_1 = require("./PubSub/SubClient");
const SubServer_1 = require("./PubSub/SubServer");
const SubTag_1 = require("./PubSub/SubTag");
const MOP_1 = require("./MOP");
const serialisation_1 = require("./serialisation");
class BufferedMirror extends MOP_1.SpiderObjectMirror {
    constructor() {
        super();
        this.buffer = [];
    }
    access(fieldName) {
        let base = this.base;
        if (fieldName == "thisMirror") {
            return base.thisMirror;
        }
        else if (base.isConnected) {
            return base.realRef[fieldName];
        }
        else {
            var that = this;
            let ret = function (...args) {
                return new Promise((resolve) => {
                    that.buffer.push(() => {
                        resolve(base.realRef[fieldName](...args));
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
                return base.realRef[methodName](...args);
            }
            else {
                return new Promise((resolve) => {
                    this.buffer.push(() => {
                        resolve(base.realRef[methodName](...args));
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
    clone(toClone) {
        let serialised = serialisation_1.serialise(toClone, null, this.environment);
        return serialisation_1.deserialise(serialised, this.environment);
    }
    setupPSClient(address = "127.0.0.1", port = 8000) {
        return new SubClient_1.PSClient(this.environment.behaviourObject, address, port);
    }
    setupPSServer() {
        this.environment.behaviourObject["_PS_SERVER_"] = new SubServer_1.PSServer();
    }
    remote(address, port) {
        return this.environment.commMedium.connectRemote(address, port);
    }
    buffRemote(address, port) {
        let ref = new BufferedRef();
        this.environment.commMedium.connectRemote(address, port).then((realRef) => {
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
    serveApp(pathToHtml, pathToClientScript, httpPort, options) {
        return new Promise((res, reject) => {
            var express = require('express');
            let path = require('path');
            let resolve = path.resolve;
            var app = express();
            var http = require('http').Server(app);
            if (options && options.publicResourceURL) {
                app.use(options.publicResourceURL, express.static(resolve(options.pathToPublicResource)));
            }
            let outHTMLParse = path.parse(pathToHtml);
            let outputHtml = outHTMLParse.dir + "/" + outHTMLParse.name + "Modified" + outHTMLParse.ext;
            app.get('/', (req, res) => {
                res.sendFile(resolve(outputHtml));
            });
            let htmlDir = path.dirname(resolve(pathToHtml));
            let bundleName = path.parse(pathToClientScript).name + "bundle.js";
            let bundlePath = htmlDir + "/" + bundleName;
            app.get("/" + bundleName, (req, res) => {
                res.sendFile(bundlePath);
            });
            let fs = require('fs');
            var bundleFs = fs.createWriteStream(bundlePath);
            var browserify = require('browserify');
            let reader = browserify(resolve(pathToClientScript)).bundle();
            reader.pipe(bundleFs);
            reader.on('end', () => {
                var jsdom = require("jsdom").JSDOM;
                var htmlSource = fs.readFileSync(pathToHtml, "utf8");
                var window = new jsdom(htmlSource).window;
                var $ = require('jquery')(window);
                let htmlFolder = path.parse(pathToHtml).dir;
                if (options && options.globalVarMappings) {
                    let varDefs = '';
                    options.globalVarMappings.forEach((value, key) => {
                        if (typeof value == "string") {
                            varDefs += "var " + key + " = " + '"' + value + '"' + ";";
                        }
                        else {
                            varDefs += "var " + key + " = " + value + ";";
                        }
                    });
                    $('head').append('<script>' + varDefs + '</script>');
                }
                $('<script>').appendTo($('body')).attr('src', htmlFolder + "/" + bundleName);
                fs.writeFile(outputHtml, '<!DOCTYPE html>' + window.document.documentElement.outerHTML, function (error) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        http.listen(httpPort);
                        res();
                    }
                });
            });
        });
    }
}
exports.ActorSTDLib = ActorSTDLib;
//# sourceMappingURL=ActorSTDLib.js.map