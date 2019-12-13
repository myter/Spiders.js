/**
 * Created by flo on 03/02/2017.
 */
import {Application, FarRef, SpiderIsolate} from "../../../src/spiders";
import {SpiderPongServer} from "../../server"

var graph               = require("./graphics")


class PortalIsolate extends SpiderIsolate{
    x
    y
    r
    c
    constructor(x,y,r,c){
        super()
        this.x = x
        this.y = y
        this.r = r
        this.c = c
    }
}

export class SpiderPongClient extends Application{
    serverRef   : FarRef<SpiderPongServer>
    nickName    : string
    currentGame

    constructor(nickName : string){
        super()
        this.nickName = nickName
        console.log("CREATING CLIENT")
        this.libs.remote("127.0.0.1",8000).then((serverRef : FarRef<SpiderPongServer>)=>{
            this.serverRef = serverRef
            console.log("CONNECTED TO SERVER")
            serverRef.newClient(this.nickName,this)
        })
        document.getElementById("newRoomButton").onclick = () => {
            var roomName = (document.getElementById('roomName') as HTMLTextAreaElement).value
            this.currentGame = new graph.game(roomName,this)
            this.serverRef.createNewGame(roomName,this,this.nickName)
            this.currentGame.start(true)
        }
    }

    private joinGame(roomName : string,gameCreator : FarRef<SpiderPongClient>){
        this.currentGame        = new graph.game(roomName,this)
        this.currentGame.setOpponentReference(gameCreator)
        this.serverRef.playerJoined(roomName,this,this.nickName)
        gameCreator.playerJoins(this,this.nickName);
        (gameCreator.getPortal() as any).then((portal)=>{
            this.currentGame.receivePortal(portal)
        })
        this.currentGame.start(false); // false indicates we joined the game and hence don't have the ball
    }

    newGameCreated(roomName : string,gameCreator : FarRef<SpiderPongClient>){
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
        console.log("CREATED NEW GAME")
    }

    playerJoins(player : FarRef<SpiderPongClient>,nickName : string){
        this.currentGame.setOpponentReference(player)
        this.currentGame.playerJoined(nickName)
    }

    updateRoomInfo(roomName){
        (document.getElementById(roomName) as any).cells[1].innerHTML = "2/2"
    }

    getPortal(){
        var gamePortal = this.currentGame.getPortal()
        return new PortalIsolate(gamePortal.x,gamePortal.y,gamePortal.r,gamePortal.c)
    }

    receiveBall(x,y,vx,vy){
        this.currentGame.receiveBall({ x: x, y: y, vx: vx, vy: vy })
    }

    scoreChange(score : number){
        this.currentGame.receiveOpponentScore(score)
    }

    receivePowerup(type : string){
        this.currentGame.receivePowerup(type)
    }

    //Invoked by UI
    sendBall(x,y,vx,vy,ref){
        ref.receiveBall(x,y,vx,vy)
    }

    //Invoked by UI
    sendScoreChange(score,ref){
        ref.scoreChange(score)
    }

    //Invoked by UI
    sendPowerup(type,ref){
        ref.receivePowerup(type)
    }
}

console.log("SCRIPT RUNNING")
document.getElementById('startButton').onclick = (ev : MouseEvent)=>{
    console.log("STARTING")
    var nickName            = (document.getElementById('nickname') as HTMLTextAreaElement).value
    new SpiderPongClient(nickName)
}
