//
const ab = require('../utils/arrayBufferUtil')

var xy = {
    '0x11': function () {
        let json = {
            "imei": '123213',
            "result": 1
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D12', json, true)
        if (!sendData.state) return;

        var data = sendData.data.buffer
        var buf = new Buffer(data.byteLength);
        var view = new Uint8Array(data);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf
    },
    "0x37": function () {
        var json = {
            "imei": "ie1029128382",// 腕表IMEI 
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D37', json, true)
        return sendData.data
    },
    "0x13": function () {
        var json = {
            "imei": "ie1029128382",
            "result": 1// 1成功2失败
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D14', json, true)
        return sendData.data
    },
    "0x15": function () {
        var json = {
            "guninfo": [{
                "gunid": "219-283918",
                "gunDes": "9mm",
                "gunMac": "FF:30:D5:41:D6:5D",//枪的模组MAC
                "username": "missLi"
            },
                // {
                //     "gunid": "218-283918",
                //     "gunDes": "9mm",
                //     "gunMac": "F9:6B:DC:91:25:9E",//枪的模组MAC
                //     "username": "missLi"
                // }
            ],
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D15', json, true)
        return sendData.data
    },
    "0x17": function () {
        var json = {
            "imei": "ie1029128382",// 腕表IMEI
            "guninfo": [{
                "gunid": "219-283918"//出库枪支
            }],
            "state": 0//请忽略此state值
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D18', json, true)
        return sendData.data
    },
    "0x19": function () {
        var json = {
            "imei": "ie1029128382",// 腕表IMEI
            "guninfo": [{
                "gunid": "219-283918"//出库枪支
            }],
            "state": 1//请忽略此state值
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D19', json, true)
        return sendData.data
    },
    "0x27": function () {
        var json = {
            "imei": "ie1029128382",// 腕表IMEI        
            "command": "03"//03表示库室控制器下发注销命令
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D27', json, true)
        return sendData.data
    },
    "0x29": function () {
        console.log("收到心跳包")
    },
    "0x54": function (data) {
        var json = {
            "imei": "ie1029128382",
            "result": 1// 1成功2失败
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D55', json, true)
        return sendData.data
    },
    "0x56": function (params) {
        var json = {
            "imei": "ie1029128382"
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D55', json, true)
        return sendData.data
    },
    "0x60": function (params) {
        var json = {
            "imei": "ie1029128382",
            "state": 2// 1出库2入库
        }
        let sendData = ab.abUtil.toHexStr('7E7E3D61', json, true)
        return sendData.data
    }

}


module.exports.xy = xy;