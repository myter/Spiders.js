let type    = process.argv[2]
let target  = process.argv[3]
console.log(process.argv)
function serverSkeleton(target){
    const { exec } = require('child_process');
    exec("cp ./server-only/main.* " + target, (err) => {
        if (err) {
            throw err
        }
    });
}
switch(type){
    case "server":
        serverSkeleton(target)
        break
    default:
        throw new Error("Unknown skeleton type: " + type)

}