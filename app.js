const Koa = require('koa');
const cors = require('koa2-cors')(); // 跨域包
const static = require('koa-static'); //静态资源包

// 自定义包
const router = require('./router/router').router;
// const UDP_SERVER = require('./src/udp').UDP_SERVER;

const HTTP_SERVER = new Koa();
const HTTP_PORT = 7777;

HTTP_SERVER.use(cors);
HTTP_SERVER.use(router.routes()).use(router.allowedMethods());
HTTP_SERVER.use(static(__dirname + "/static/html", { extensions: ['html'] }));

HTTP_SERVER.listen(HTTP_PORT, () => {
    console.log('HTTP SERVER START ON : ' + HTTP_PORT)
})





