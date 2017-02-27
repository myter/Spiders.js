import {SpiderLib, FarRef} from "../../../src/spiders";
/**
 * Created by flo on 03/02/2017.
 */
var spiders : SpiderLib = require("../../../src/spiders")
var graph               = require("./graphics")


class PortalIsolate extends spiders.Isolate{
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

class SpiderPongClient extends spiders.Application{
    serverRef   : FarRef
    nickName    : string
    currentGame

    constructor(nickName : string){
        super()
        this.nickName = nickName
        this.remote("127.0.0.1",8000).then((serverRef : FarRef)=>{
            console.log("Server ref acquired")
            this.serverRef = serverRef
            serverRef.newClient(this.nickName,this)
        })
        document.getElementById("newRoomButton").onclick = () => {
            var roomName = (document.getElementById('roomName') as HTMLTextAreaElement).value
            this.currentGame = new graph.game(roomName)
            this.serverRef.createNewGame(roomName,this,this.nickName)
            this.currentGame.start(true)
        }
    }

    private joinGame(roomName : string,gameCreator : FarRef){
        this.currentGame        = new graph.game(roomName)
        this.currentGame.setOpponentReference(gameCreator)
        this.serverRef.playerJoined(roomName,this,this.nickName)
        gameCreator.playerJoins(this,this.nickName)
        gameCreator.getPortal().then((portal)=>{
            this.currentGame.receivePortal(portal)
        })
        this.currentGame.start(false); // false indicates we joined the game and hence don't have the ball
    }

    newGameCreated(roomName : string,gameCreator : FarRef){
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

    playerJoins(player : FarRef,nickName : string){
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
}

(window as any).start = ()=>{
    var nickName            = (document.getElementById('nickname') as HTMLTextAreaElement).value
    new SpiderPongClient(nickName)
}
