const dgram = require('dgram');

class UDP {

    constructor(port) {
        this.UDP_SERVER = null;
        this.clientInfo = {
            ip: '',
            port: ''
        };
        this.port = port;
        this.init()
    }

    init() {
        this.UDP_SERVER = dgram.createSocket('udp4');
        this.UDP_SERVER.bind(this.port)
        this.UDP_SERVER.on('listening', () => {
            console.log('UDP SERVER START ON 7777')
        })
        this.UDP_SERVER.on('message', this.onMessage.bind(this))
    }

    onMessage(msg, rinfo) {
        this.clientInfo.ip = rinfo.address;
        this.clientInfo.port = rinfo.port;
        let arrBuff = buff2arrBuff(msg);
        // dispatch event
        console.log(arrBuff)
    }
    /**
     * 
     * @param {Buffer} option 
     */
    send(option) {
        if (options) return;
        this.UDP_SERVER.send(option)
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
function buff2arrBuff(buffer){
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
function arrBuff2Buff(arrayBuffer){
    var buff = new Buffer(arrayBuffer.byteLength);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buff.length; ++i) {
        buff[i] = view[i];
    }
    return buff;
}


module.exports.UDP_SERVER = new UDP(7777);