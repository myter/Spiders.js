var LZString = require("lz-string");
let t = "helloéefueizufhzieufhzeiufhzeiufhzeiufhzeiufhzeiufhzeiufhzeiufhzeiufh";
let x = LZString.compress(t);
console.log("t length= " + t.length);
console.log("compress length= " + x.length);
console.log(LZString.decompress(x));
console.log("Decompress length = " + LZString.decompress(x).length);
//# sourceMappingURL=test.js.map