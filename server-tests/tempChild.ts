/**
 * Created by flo on 21/02/2017.
 */
process.on('message',(data)=>{
    if(data[0]){
        data[1].send('message',[false,"Hello from c1"])
    }
    else{
        console.log("Child got : " + data[1])
    }
})
process.send(["hello"])