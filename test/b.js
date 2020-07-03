// const a = require('./a');
// console.log('aaaaaaaaa')
// console.log(a)

// module.exports = function () {
//     console.log("b")
// }

module.exports.done = false
var b = require('./a.js')

console.log(`在b模块中，b.done=${b.done}bbb`)
module.exports.done = true
console.log('b模块执行完毕bb')