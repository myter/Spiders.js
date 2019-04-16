/**
 * Created by flo on 03/02/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../src/spiders");
class Player {
    constructor(ref, name) {
        this.ref = ref;
        this.name = name;
    }
}
class SpiderPongServer extends spiders_1.Application {
    constructor() {
        super();
        this.games = new Map();
        this.clients = new Map();
        this.occupation = new Map();
        console.log("Starting SpiderPong server");
        let resourceOptions = {
            publicResourceURL: '/public',
            pathToPublicResource: './public'
        };
        this.libs.serveApp("./index.html", "./public/js/logic.js", 8888, resourceOptions).then(() => {
            console.log("Server running on port 8888");
        });
    }
    newClient(nickName, ref) {
        this.clients.set(nickName, new Player(ref, nickName));
        this.games.forEach((creator, roomName) => {
            ref.newGameCreated(roomName, creator.ref);
            if (this.occupation.get(roomName) > 1) {
                ref.updateRoomInfo(roomName);
            }
        });
    }
    createNewGame(roomName, creatorRef, creatorName) {
        this.games.set(roomName, new Player(creatorRef, creatorName));
        this.occupation.set(roomName, 1);
        this.clients.forEach((client) => {
            if (client.name != creatorName) {
                client.ref.newGameCreated(roomName, creatorRef);
            }
        });
    }
    playerJoined(roomName, playerRef, playerName) {
        var otherPlayer = this.games.get(roomName);
        this.occupation.set(roomName, this.occupation.get(roomName) + 1);
        this.clients.forEach((client) => {
            if (client.name != playerName && client.name != otherPlayer.name) {
                client.ref.updateRoomInfo(roomName);
            }
        });
    }
}
exports.SpiderPongServer = SpiderPongServer;
new SpiderPongServer();
//# sourceMappingURL=server.js.map