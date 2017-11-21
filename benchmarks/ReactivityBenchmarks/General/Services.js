Object.defineProperty(exports, "__esModule", { value: true });
const MicroService_1 = require("../../../src/MicroService/MicroService");
var spiders = require("../../../src/spiders");
exports.masterId = 0;
exports.masterIP = "127.0.0.1";
exports.admitterId = 1;
exports.admitterIP = "127.0.0.1";
exports.piIds = [];
for (var i = 2; i < 60; i++) {
    exports.piIds.push(i);
}
exports.piAddresses = exports.piIds.map((id, index) => {
    //TODO find out real IP addresses
    return "127.0.0.1";
});
//TEMP
let admitterPort = 8001;
let masterPort = 8000;
let base = 8002;
exports.piPorts = exports.piIds.map((id, index) => {
    return base + index;
});
class Admitter extends MicroService_1.MicroServiceApp {
}
exports.Admitter = Admitter;
class SourceService extends MicroService_1.MicroServiceApp {
}
exports.SourceService = SourceService;
class CentralService extends MicroService_1.MicroServiceApp {
}
exports.CentralService = CentralService;
//# sourceMappingURL=Services.js.map