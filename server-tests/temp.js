Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
let app = new spiders_1.Application();
app.spawnActorFromFile(__dirname + "/testActorDefinition", "TestActor", ["hello", app]);
//# sourceMappingURL=temp.js.map