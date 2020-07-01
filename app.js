const dgram = require('dgram')
const koa = require('koa')
const serve = require('koa-static')
const router = require('koa-router')()
const cors = require('koa2-cors')
// import tool
const ab = require('./utils/arrayBufferUtil')
const xy = require('./agreement/agrement')
const resovleObj = xy.xy;
// create UDP Server
const UDP_SERVER = dgram.createSocket('udp4');


// 本机配置
const ip = '10.10.0.29' //  watch ip
const port = 7951;


UDP_SERVER.bind(2555);
UDP_SERVER.on('listening', () => {
    console.log('UDP SERVER LISTENING 2555')
})
// error
UDP_SERVER.on('error', err => {
    console.log(err);
    UDP_SERVER.close()
})


// onMessage
UDP_SERVER.on('message', (msg, rinfo) => {
    // console.log(`get Msg from ip= ${rinfo.address} and port= ${rinfo.port}`)
    const port = rinfo.port;
    const ip = rinfo.address;
    let data = ab.abUtil.getData(msg)
    const cmd = data.cmd;
    let param = data.data
    console.log('腕表发送协议:' + cmd)
    let needReplyMsg = resovleObj[cmd](param)
    UDP_SERVER.send(needReplyMsg, port, ip)
})


// http

const app = new koa()

app.use(serve(__dirname + "/static/html", { extensions: ['html'] }));
app.use(cors())
app.use(router.routes()).use(router.allowedMethods())

app.listen(7777, function () {
    console.log('HTTP SERVER LISTENING 7777')
})


// router
router.get("/reg", async (ctx, next) => {
    console.log('拦截reg')
    let data = resovleObj["0x37"]()
    UDP_SERVER.send(data, port, ip)
})

router.get("/logout", async (ctx, next) => {
    console.log('拦截logout')
    let data = resovleObj["0x27"]()
    UDP_SERVER.send(data, port, ip)
})

router.get("/bind", async (ctx, next) => {
    console.log('拦截bind')
    let data = resovleObj["0x15"]()
    UDP_SERVER.send(data, port, ip)
})

router.get('/reBind', async (ctx, next) => {
    console.log('拦截reBind')
    let data = resovleObj["0x15"]();
    UDP_SERVER.send(data, port, ip)
})

router.get("/outStore", async (ctx, next) => {
    console.log('拦截outStore')
    let data = resovleObj[""]()
    UDP_SERVER.send(data, port, ip)
})

router.get("/cancelOut", async (ctx, next) => {
    console.log('拦截cancelOut')
    let data = resovleObj[""]()
    UDP_SERVER.send(data, port, ip)
})


router.get("/inStore", async (ctx, next) => {
    console.log('拦截inStore')
    let data = resovleObj[""]()
    UDP_SERVER.send(data, port, ip)
})