var connection = require('socket.io-client')('http://127.0.0.1:8888')
console.log("Slave spawned")
/*connection.on('connect',() => {
    that.removeFromDisconnected(actorId,connection)
    //TODO To remove once solution found
    if(that.fuckUpMessage.has(actorId)){
        that.fuckUpMessage.get(actorId).forEach((msg : Message)=>{
            that.sendMessage(actorId,msg)
        })
    }
})*/
connection.on('message',(data)=>{
    console.log("Received message")
    connection.emit('message',Date.now())
})