const resovleObj = require('../agreement/agrement').xy;
const UDP_SERVER = require('../src/udp');


const ctrl = {

    register() {
        let data = resovleObj["0x37"]()
        UDP_SERVER.send(data)
    },

    logout() {
        let data = resovleObj["0x27"]();
        UDP_SERVER.send(data)
    },

    bind() {
        let data = resovleObj["0x15"]()
        UDP_SERVER.send(data)
    },

    rebind() {
        let data = resovleObj["0x15"]();
        UDP_SERVER.send(data)
    },

    outStore() {
        let data = resovleObj["0x19"]()
        UDP_SERVER.send(data)
    },

    cancelOut() {
        let data = resovleObj["0x56"]()
        UDP_SERVER.send(data)
    },

    inStore() {
        let data = resovleObj["0x23"]()
        UDP_SERVER.send(data)
    }
}



module.exports = ctrl;