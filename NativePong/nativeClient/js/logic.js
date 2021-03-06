/**
 * Created by flo on 06/02/2017.
 */
var graph = require('./graphics');
class NativePongClient {
    constructor(nickName) {
        this.serverRef = require('socket.io-client')('http://127.0.0.1:8000');
        this.nickName = nickName;
        var that = this;
        this.serverRef.on('message', (data) => {
            switch (data[0]) {
                case "updateRoomInfo":
                    that.updateRoomInfo(data[1]);
                    break;
                case "newGameCreated":
                    that.newGameCreated(data[1], data[2]);
                    break;
                case "playerJoins":
                    that.playerJoins(data[1]);
                    break;
                case "getPortal":
                    that.getPortal(data[1]);
                    break;
                case "receivePortal":
                    that.receivePortal(data[1], data[2], data[3], data[4]);
                    break;
                case "receiveBall":
                    that.receiveBall(data[1], data[2], data[3], data[4]);
                    break;
                case "scoreChange":
                    that.scoreChange(data[1]);
                    break;
                case "receivePowerup":
                    that.receivePowerup(data[1]);
                    break;
                default:
                    console.log("Client did not understand message : " + data[0]);
            }
        });
        this.serverRef.emit('message', ["newClient", this.nickName]);
        document.getElementById("newRoomButton").onclick = () => {
            var roomName = document.getElementById('roomName').value;
            this.currentGame = new graph.game(that, roomName);
            this.serverRef.emit('message', ["createNewGame", roomName, this.nickName]);
            this.currentGame.start(true);
        };
    }
    joinGame(roomName, gameCreator) {
        this.currentGame = new graph.game(this, roomName);
        this.currentGame.setOpponentReference(gameCreator);
        this.serverRef.emit('message', ["playerJoined", roomName, this.nickName]);
        this.serverRef.emit('message', ["forwardPlayerJoins", gameCreator, this.nickName]);
        this.serverRef.emit('message', ["forwardGetPortal", gameCreator, this.nickName]);
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
    }
    playerJoins(nickName) {
        this.currentGame.setOpponentReference(nickName);
        this.currentGame.playerJoined(nickName);
    }
    updateRoomInfo(roomName) {
        document.getElementById(roomName).cells[1].innerHTML = "2/2";
    }
    getPortal(requester) {
        var gamePortal = this.currentGame.getPortal();
        this.serverRef.emit('message', ["forwardReceivePortal", requester, gamePortal.x, gamePortal.y, gamePortal.r, gamePortal.c]);
    }
    receivePortal(x, y, r, c) {
        this.currentGame.receivePortal({ x: x, y: y, r: r, c: c });
    }
    receiveBall(x, y, vx, vy) {
        this.currentGame.receiveBall({ x: x, y: y, vx: vx, vy: vy });
    }
    //Invoked by the UI
    sendBallTo(opponent, x, y, vx, vy) {
        this.serverRef.emit('message', ["forwardReceiveBall", opponent, x, y, vx, vy]);
    }
    //Invoked by the UI
    sendScoreChangeTo(opponent, score) {
        this.serverRef.emit('message', ["forwardScoreChange", opponent, score]);
    }
    //Invoked by the UI
    sendPowerupTo(opponent, type) {
        this.serverRef.emit('message', ["forwardReceivePowerup", opponent, type]);
    }
    scoreChange(score) {
        this.currentGame.receiveOpponentScore(score);
    }
    receivePowerup(type) {
        this.currentGame.receivePowerup(type);
    }
}
window.start = () => {
    var nickName = document.getElementById('nickname').value;
    new NativePongClient(nickName);
};
//# sourceMappingURL=logic.js.map