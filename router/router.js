const router = require('koa-router')();

//
const dispatchEvent = require('../controller/controller');

// const resovleObj = require('../agreement/agrement').xy;
// const UDP_SERVER = require('../src/udp');



router.get("/reg", async (ctx, next) => {
    console.log('拦截reg')
    dispatchEvent.register()
})

router.get("/logout", async (ctx, next) => {
    console.log('拦截logout')
    dispatchEvent.logout()
})

router.get("/bind", async (ctx, next) => {
    console.log('拦截bind')
    dispatchEvent.bind()
})

router.get('/reBind', async (ctx, next) => {
    console.log('拦截reBind')
    dispatchEvent.rebind()
})

router.get("/outStore", async (ctx, next) => {
    console.log('拦截outStore')
    dispatchEvent.outStore()
})

router.get("/cancelOut", async (ctx, next) => {
    console.log('拦截cancelOut')
    dispatchEvent.cancelOut()
})


router.get("/inStore", async (ctx, next) => {
    console.log('拦截inStore')
    dispatchEvent.inStore()
})



module.exports.router = router;