const router = require('koa-router')();

//
const dispatchEvent = require('../controller/controller');

// const resovleObj = require('../agreement/agrement').xy;
// const UDP_SERVER = require('../src/udp');



router.get("/reg", async (ctx, next) => {
    console.log('拦截reg')
    let data = resovleObj["0x37"]()
    UDP_SERVER.send(data)
})

router.get("/logout", async (ctx, next) => {
    console.log('拦截logout')
    dispatchEvent.logout()
})

router.get("/bind", async (ctx, next) => {
    console.log('拦截bind')
    let data = resovleObj["0x15"]()
    UDP_SERVER.send(data)
})

router.get('/reBind', async (ctx, next) => {
    console.log('拦截reBind')
    let data = resovleObj["0x15"]();
    UDP_SERVER.send(data)
})

router.get("/outStore", async (ctx, next) => {
    console.log('拦截outStore')
    let data = resovleObj["0x19"]()
    UDP_SERVER.send(data)
})

router.get("/cancelOut", async (ctx, next) => {
    console.log('拦截cancelOut')
    let data = resovleObj["0x56"]()
    UDP_SERVER.send(data)
})


router.get("/inStore", async (ctx, next) => {
    console.log('拦截inStore')
    let data = resovleObj["0x23"]()
    UDP_SERVER.send(data)
})



module.exports.router = router;