"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var serialisation_1 = require("../serialisation");
/**
 * Created by flo on 30/06/2017.
 */
var spiders = require("../spiders");
var PreInstallInfo = (function () {
    function PreInstallInfo(serviceClass, serviceTag, dependencies, initialVal) {
        this.serviceClass = serviceClass;
        this.serviceTag = serviceTag;
        this.dependencies = dependencies;
        this.dependants = [];
        this.initialVal = initialVal;
    }
    return PreInstallInfo;
}());
var GraphInfo = (function () {
    function GraphInfo(ownType, directParents, directChildren, initialValue) {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
        this.ownType = ownType;
        this.directParents = directParents;
        this.directChildren = directChildren;
    }
    return GraphInfo;
}());
exports.GraphInfo = GraphInfo;
var ServiceMonitor = (function (_super) {
    __extends(ServiceMonitor, _super);
    function ServiceMonitor() {
        var _this = _super.call(this) || this;
        _this.PSServer();
        _this.services = new Map();
        _this.toDeploy = new Map();
        var stdin = process.openStdin();
        var that = _this;
        stdin.addListener("data", function (d) {
            var command = d.toString().trim();
            var args = command.split(" ");
            console.log("[DEBUG] Command : " + command);
            switch (args[0]) {
                case "deploy":
                    var serviceName = args[1].toString();
                    var definitionPath = args[2].toString();
                    var className = void 0;
                    if (args[3] == undefined) {
                        className = serviceName;
                    }
                    else {
                        className = args[3].toString();
                    }
                    that.deployService(process.cwd(), serviceName, definitionPath, className);
                    break;
                case "deploy-all":
                    var serviceNames = JSON.parse(args[1]);
                    var definitionPath = args[2].toString();
                    var classNames_1 = JSON.parse(args[3]);
                    serviceNames.forEach(function (serviceName, index) {
                        that.deployService(process.cwd(), serviceName, definitionPath, classNames_1[index]);
                    });
                    break;
                case "ls-services":
                    that.listServices();
                    break;
                case "update":
                    //TODO re-deploy the service with the specified name, new file definition is optional
                    break;
                default:
                    console.log("Unknown command");
            }
        });
        return _this;
    }
    ServiceMonitor.prototype.logInfo = function (msg) {
        console.log("[INFO] " + msg);
    };
    ServiceMonitor.prototype.warnInfo = function (msg) {
        console.log("[WARNING] " + msg);
    };
    //Register a service provided the service's class and the list of services it depends on
    ServiceMonitor.prototype.installRService = function (serviceClass, serviceTag, dependencies, initialVal) {
        this.toDeploy.set(serviceTag.tagVal, new PreInstallInfo(serviceClass, serviceTag, dependencies, initialVal));
    };
    //Deploys all services and wires together the dependency graph
    ServiceMonitor.prototype.deploy = function () {
        var _this = this;
        //Add dependants information for each service
        this.toDeploy.forEach(function (info) {
            info.dependencies.forEach(function (dependency) {
                _this.toDeploy.get(dependency.tagVal).dependants.push(info.serviceTag);
            });
        });
        //Spawn each service and make it setup QPROP using dependency information
        this.toDeploy.forEach(function (info) {
            var service = _this.spawnActor(info.serviceClass);
            var graphInfo = new GraphInfo(info.serviceTag, info.dependencies, info.dependants, info.initialVal);
            service.setupInfo(graphInfo);
        });
    };
    //Used for command line interface
    ServiceMonitor.prototype.deployService = function (currentDir, serviceName, definitionPath, className) {
        //TODO configuration arguments
        if (definitionPath.startsWith(".")) {
            definitionPath = currentDir + definitionPath.slice(1, definitionPath.length);
        }
        this.logInfo("Deploying service : " + serviceName + " definition path: " + definitionPath);
        var actorRef = this.spawnActorFromFile(definitionPath, className);
        this.services.set(serviceName, actorRef);
    };
    ServiceMonitor.prototype.listServices = function () {
        var _this = this;
        this.logInfo("Current active services:");
        this.services.forEach(function (_, serviceName) {
            _this.logInfo("- " + serviceName);
        });
    };
    return ServiceMonitor;
}(spiders.Application));
exports.ServiceMonitor = ServiceMonitor;
