import {Socket} from "net";
/**
 * Created by flo on 06/02/2017.
 */
var graph = require('./graphics')

class NativePongClient{
    serverRef   : Socket
    nickName    : string
    currentGame

    constructor(nickName : string){
        this.serverRef  = require('socket.io-client')('http://127.0.0.1:8000')
        this.nickName   = nickName
        var that        = this
        this.serverRef.on('message',(data)=>{
            switch(data[0]){
                case "updateRoomInfo":
                    that.updateRoomInfo(data[1])
                    break
                case "newGameCreated":
                    that.newGameCreated(data[1],data[2])
                    break
                case "playerJoins":
                    that.playerJoins(data[1])
                    break
                case "getPortal":
                    that.getPortal(data[1])
                    break
                case "receivePortal":
                    that.receivePortal(data[1],data[2],data[3],data[4])
                    break
                case "receiveBall":
                    that.receiveBall(data[1],data[2],data[3],data[4])
                    break
                case "scoreChange":
                    that.scoreChange(data[1])
                    break
                case "receivePowerup":
                    that.receivePowerup(data[1])
                    break
                default:
                    console.log("Client did not understand message : " + data[0])
            }
        })
        this.serverRef.emit('message',["newClient",this.nickName])
        document.getElementById("newRoomButton").onclick = () => {
            var roomName = (document.getElementById('roomName') as HTMLTextAreaElement).value
            this.currentGame = new graph.game(that,roomName)
            this.serverRef.emit('message',["createNewGame",roomName,this.nickName])
            this.currentGame.start(true)
        }
    }

    private joinGame(roomName : string,gameCreator : string){
        this.currentGame        = new graph.game(this,roomName)
        this.currentGame.setOpponentReference(gameCreator)
        this.serverRef.emit('message',["playerJoined",roomName,this.nickName])
        this.serverRef.emit('message',["forwardPlayerJoins",gameCreator,this.nickName])
        this.serverRef.emit('message',["forwardGetPortal",gameCreator,this.nickName])
        this.currentGame.start(false); // false indicates we joined the game and hence don't have the ball
    }

    newGameCreated(roomName : string,gameCreator : string){
        var row                 = (document.getElementById('roomList') as HTMLTableElement).insertRow()
        var nameCell            = row.insertCell()
        var noPlayersCell       = row.insertCell()
        row.id                  = roomName
        nameCell.innerHTML      = roomName
        noPlayersCell.innerHTML = "1/2"
        var that                = this
        row.onclick             = function() {
            if(noPlayersCell.innerHTML === "1/2") {
                that.joinGame(roomName,gameCreator)
            }
        };
    }

    playerJoins(nickName : string){
        this.currentGame.setOpponentReference(nickName)
        this.currentGame.playerJoined(nickName)
    }

    updateRoomInfo(roomName){
        (document.getElementById(roomName) as any).cells[1].innerHTML = "2/2"
    }

    getPortal(requester : string){
        var gamePortal = this.currentGame.getPortal()
        this.serverRef.emit('message',["forwardReceivePortal",requester,gamePortal.x,gamePortal.y,gamePortal.r,gamePortal.c])
    }

    receivePortal(x,y,r,c){
        this.currentGame.receivePortal({x:x,y:y,r:r,c:c})
    }

    receiveBall(x,y,vx,vy){
        this.currentGame.receiveBall({ x: x, y: y, vx: vx, vy: vy })
    }

    sendBallTo(opponent : string,x,y,vx,vy){
        this.serverRef.emit('message',["forwardReceiveBall",opponent,x,y,vx,vy])
    }

    sendScoreChangeTo(opponent : string,score){
        this.serverRef.emit('message',["forwardScoreChange",opponent,score])
    }

    sendPowerupTo(opponent : string,type){
        this.serverRef.emit('message',["forwardReceivePowerup",opponent,type])
    }

    scoreChange(score : number){
        this.currentGame.receiveOpponentScore(score)
    }

    receivePowerup(type : string){
        this.currentGame.receivePowerup(type)
    }
}
(window as any).start = ()=>{
    var nickName            = (document.getElementById('nickname') as HTMLTextAreaElement).value
    new NativePongClient(nickName)
}