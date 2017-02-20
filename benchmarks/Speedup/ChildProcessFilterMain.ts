import {SpiderBenchmark, BenchConfig, ServerBufferSocket} from "../benchUtils";
export class ChildProcessFilterBench extends SpiderBenchmark{
    mainSocket
    lastPort = 8001

    constructor(){
        super("Child Process Parallel Filter","Child Process Parallel Filter cycle completed","Child Process Parallel Filter completed","Child Process Parallel Filter scheduled")
    }

    randomKernel(kernel) {
        for(var i in kernel) {
            for (var j in kernel[0]) {
                kernel[i][j] = Math.random();
            }
        }
        return kernel;
    }

    runBenchmark(){
        var resultsReceived = 0
        var that            = this
        //The only even received is the "result" event
        function messageHandler(event){
            resultsReceived += 1
            if(resultsReceived == BenchConfig.filterImageWorkers){
                that.stopPromise.resolve()
            }
        }
        this.mainSocket = new ServerBufferSocket(SpiderBenchmark._MAIN_PORT_,messageHandler)
        var imageData = BenchConfig.makeFilterImage()
        var kernel   = this.randomKernel(BenchConfig.filterBaseKernal)
        var totalWidth = imageData.width
        var totalHeight = imageData.height
        var totalPixels  = imageData.data
        var widthPerWorker = Math.ceil(totalWidth / BenchConfig.filterImageWorkers)
        var heightPerWorker = Math.ceil(totalHeight / BenchConfig.filterImageWorkers)
        var pixelsPerWorker = Math.ceil(totalPixels.length / BenchConfig.filterImageWorkers)
        // console.log("Pixels per worker : " + pixelsPerWorker + " width " + widthPerWorker + " height " + heightPerWorker)
        for(var i = 0;i < BenchConfig.filterImageWorkers;i++){
            let act = this.spawnNode('./ChildProcessFilterWorker',messageHandler,that.lastPort)
            var stop = pixelsPerWorker
            if(stop > totalPixels.length){
                stop = totalPixels.length
            }
            var actData = (totalPixels as any).splice(0,stop)
            act.emit([kernel,actData,widthPerWorker,heightPerWorker])
            that.lastPort++
        }
    }

    cleanUp(){
        this.cleanNodes()
        this.mainSocket.close()
    }
}