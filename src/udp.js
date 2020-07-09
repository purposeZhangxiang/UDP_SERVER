const dgram = require('dgram');
// 自定义包
const abUtil = require('../utils/arrayBufferUtil').abUtil;
const agreement = require('../agreement/agrement').xy;


class UDP {

    constructor(port) {
        this.UDP_SERVER = null;
        this.clientInfo = {
            ip: '10.10.0.29',
            port: '7951'
        };
        this.port = port;
        this.init()
    }

    init() {
        this.UDP_SERVER = dgram.createSocket('udp4');
        this.UDP_SERVER.bind(this.port)
        this.UDP_SERVER.on('listening', () => {
            console.log(`UDP SERVER START ON ${this.port}`)
        })
        this.UDP_SERVER.on('close', () => {
            console.log(`UDP SERVER CLOSED`)
        })
        this.UDP_SERVER.on('message', this.onMessage.bind(this))
    }

    onMessage(msg, rinfo) {
        this.clientInfo.ip = rinfo.address;
        this.clientInfo.port = rinfo.port;
        let pipeData = abUtil.getData(msg);
        // dispatch event
        dispatchEvent(pipeData)
    }
    /**
     * 
     * @param {Buffer} option 
     */
    send(option) {
        if (!option) return;
        this.UDP_SERVER.send(option, this.clientInfo.port, this.clientInfo.ip)
    }

    close() {
        this.UDP_SERVER.close()
    }
}

/**
 * 
 * @param {Buffer} buffer 
 * @return {ArrayBuffer} 
 */
const buff2arrBuff = (buffer) => {
    let arrayBuffer = new ArrayBuffer(buffer.length);
    let view = new Uint8Array(arrayBuffer)
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i]
    }
    return view;
}
/**
 * 
 * @param {ArrayBuffer} arrayBuffer 
 * @return {Buffer} 
 */
const arrBuff2Buff = (arrayBuffer) => {
    var buff = new Buffer(arrayBuffer.byteLength);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buff.length; ++i) {
        buff[i] = view[i];
    }
    return buff;
}


const UDP_SERVER = new UDP(2555);



const dispatchEvent = (param) => {
    if (!param.state) throw ('UDP数据解析失败');
    const { cmd, data } = param;
    console.log(`${getNowTime()} 收到协议：${cmd} 数据体：${data}`)
    let replyData = agreement[cmd](data);
    UDP_SERVER.send(replyData)
}

const getNowTime = () => {
    let date = new Date();
    let now = date.getHours().toString() + ':' + date.getMinutes() + ':' + date.getSeconds()
    return now;
}



module.exports = UDP_SERVER;
