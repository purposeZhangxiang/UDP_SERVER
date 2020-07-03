// const b = require('./b');
// console.log("..")
// console.log(b)

// module.exports = function(){
//     console.log("a")
// }


module.exports.done = false
var b = require('./b.js')
console.log(`在a模块中，b.done=${b.done}`)
module.exports.done = true
console.log('a模块执行完毕')