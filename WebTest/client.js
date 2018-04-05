Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class Client extends spiders_1.Application {
    constructor() {
        super();
        console.log("Client created");
        let server = this.libs.buffRemote("127.0.0.1", 8000);
        this.libs.remote("127.0.0.1", 8000).then((serverRef) => {
            console.log("Connected to server");
        });
    }
}
new Client();
//# sourceMappingURL=client.js.map