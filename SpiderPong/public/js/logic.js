Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 03/02/2017.
 */
const spiders_1 = require("../../../src/spiders");
var graph = require("./graphics");
class PortalIsolate extends spiders_1.SpiderIsolate {
    constructor(x, y, r, c) {
        super();
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
    }
}
class SpiderPongClient extends spiders_1.Application {
    constructor(nickName) {
        super();
        this.nickName = nickName;
        console.log("CREATING CLIENT");
        this.libs.remote("127.0.0.1", 8000).then((serverRef) => {
            this.serverRef = serverRef;
            console.log("CONNECTED TO SERVER");
            serverRef.newClient(this.nickName, this);
        });
        document.getElementById("newRoomButton").onclick = () => {
            var roomName = document.getElementById('roomName').value;
            this.currentGame = new graph.game(roomName, this);
            this.serverRef.createNewGame(roomName, this, this.nickName);
            this.currentGame.start(true);
        };
    }
    joinGame(roomName, gameCreator) {
        this.currentGame = new graph.game(roomName, this);
        this.currentGame.setOpponentReference(gameCreator);
        this.serverRef.playerJoined(roomName, this, this.nickName);
        gameCreator.playerJoins(this, this.nickName);
        gameCreator.getPortal().then((portal) => {
            this.currentGame.receivePortal(portal);
        });
        this.currentGame.start(false); // false indicates we joined the game and hence don't have the ball
    }
    newGameCreated(roomName, gameCreator) {
        var row = document.getElementById('roomList').insertRow();
        var nameCell = row.insertCell();
        var noPlayersCell = row.insertCell();
        row.id = roomName;
        nameCell.innerHTML = roomName;
        noPlayersCell.innerHTML = "1/2";
        var that = this;
        row.onclick = function () {
            if (noPlayersCell.innerHTML === "1/2") {
                that.joinGame(roomName, gameCreator);
            }
        };
        console.log("CREATED NEW GAME");
    }
    playerJoins(player, nickName) {
        this.currentGame.setOpponentReference(player);
        this.currentGame.playerJoined(nickName);
    }
    updateRoomInfo(roomName) {
        document.getElementById(roomName).cells[1].innerHTML = "2/2";
    }
    getPortal() {
        var gamePortal = this.currentGame.getPortal();
        return new PortalIsolate(gamePortal.x, gamePortal.y, gamePortal.r, gamePortal.c);
    }
    receiveBall(x, y, vx, vy) {
        this.currentGame.receiveBall({ x: x, y: y, vx: vx, vy: vy });
    }
    scoreChange(score) {
        this.currentGame.receiveOpponentScore(score);
    }
    receivePowerup(type) {
        this.currentGame.receivePowerup(type);
    }
    //Invoked by UI
    sendBall(x, y, vx, vy, ref) {
        ref.receiveBall(x, y, vx, vy);
    }
    //Invoked by UI
    sendScoreChange(score, ref) {
        ref.scoreChange(score);
    }
    //Invoked by UI
    sendPowerup(type, ref) {
        ref.receivePowerup(type);
    }
}
exports.SpiderPongClient = SpiderPongClient;
console.log("SCRIPT RUNNING");
document.getElementById('startButton').onclick = (ev) => {
    console.log("STARTING");
    var nickName = document.getElementById('nickname').value;
    new SpiderPongClient(nickName);
};
//# sourceMappingURL=logic.js.map