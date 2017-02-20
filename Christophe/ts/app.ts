import {SpiderLib, FarRef} from "../../src/spiders";
/**
 * Created by flo on 07/02/2017.
 */
var spiders : SpiderLib = require("../../src/spiders")


class MyMainActor extends spiders.Application{
    counter : number
    constructor(){
        super()
        this.counter = 0
    }
    updateCounter() {
        console.log("update counter");
        this.counter += 1
        var label = (document.getElementById("counterLabel") as HTMLLabelElement)
        label.innerHTML = this.counter.toString()
    }
}


class MyIsolate extends spiders.Isolate{

}


class CounterActor extends spiders.Actor {
    MyIsolate
    constructor(){
        super()
        this.MyIsolate = MyIsolate
    }
    init(){
        var that = this
        this.remote("",8080).then((serverRef)=>{

        })
        setTimeout(()=>{
            that.parent.updateCounter()
            that.init()
        },500)
    }

    getRef(actorRef : FarRef){

    }
}

var img = new Image();
img.src = "pics/lena_color.gif"
var canvas = document.getElementById('canvas');
var ctx = (canvas as any).getContext('2d');

var kernel = [
    [0 , -1 ,  0],
    [-1,  2 , -1],
    [0 , -1 ,  0]
];

function index_destination(width,x,y) {
    return ((width * y) + x) * 4;
}

function filter(kernel, pixels) {
    var kernel_w   = kernel[0].length;
    var kernel_h   = kernel.length;
    var width      = pixels.width;
    var height     = pixels.height;
    var new_image  = new ImageData(width, height);
    var new_pixels = new_image.data;
    var pixel = 0;
    var rgb_pos   = [0,1,2];
    var hue_pos   = 3;

    for(var w=0; w < width-kernel_w; w+=1) {
        for(var h=0; h < height-kernel_h; h+=1) {
            var index_d  = index_destination(width,w,h);
            new_pixels[index_d+hue_pos] = 255;
            for(var i=0; i<kernel_w;i+=1) {
                for(var j=0; j<kernel_h;j+=1) {
                    var index_o  = index_d + (i*4) + (j*width*4);
                    for (var x of rgb_pos)
                        new_pixels[index_d + x] += kernel[j][i] * pixels.data[index_o + x];
                }
            }
        }
    }

    return new_image;
}

var pixels;

function randomKernel() {
    for(var i in kernel) {
        for (var j in kernel[0]) {
            kernel[i][j] = Math.random();
        }
    }
    return kernel;
}

function applyFilter() {
    setTimeout(()=>{
        ctx.putImageData(filter(kernel,pixels),0,0);
        applyFilter();
    },10)
}

img.onload = function() {
    ctx.drawImage(img, 0, 0);
    img.style.display = 'none';
    pixels = ctx.getImageData(0, 0, 800, 600);
    applyFilter();
};


var label = (document.getElementById("counterLabel") as HTMLLabelElement)
label.innerHTML = "Starting the app..."


var app = new MyMainActor()
var ref1 : FarRef = app.spawnActor(CounterActor)
var ref2 : FarRef = app.spawnActor(CounterActor)
ref1.getRef(ref2)
ref2.getRef(ref1)