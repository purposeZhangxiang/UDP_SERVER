const resovleObj = require('../agreement/agrement').xy;
const UDP_SERVER = require('../src/udp');


const ctrl = {

    logout(){
        let data = resovleObj["0x27"]();
        UDP_SERVER.send(data)
    }
}



module.exports = ctrl;