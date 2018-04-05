var io      = require('socket.io')
var socket  = io(8888)
var fork    = require('child_process').fork

fork('./NativePerformanceSlave.js')

let start

socket.on('connection',(client)=>{
    start = Date.now()
    client.emit("message")
    client.on('message',(data)=>{
        console.log("Time taken: " + (data - start))
    })
})

