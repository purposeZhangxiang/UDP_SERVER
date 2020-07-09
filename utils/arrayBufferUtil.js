let ENV;
try {
    if (this === window) {
        console.log('broswer环境运行')
        ENV = 'broswer';
    }
} catch (error) {
    console.log('node环境运行')
    ENV = 'node';
}
/**
 * @desc 对数据协议进行解析的工具类
 * @author micrometer
 * @date 2019-11-27
 */
var abUtil = {
    /**
     * 将16进制数据解析成需要的json数据
     * @param targetStr :从后台获取到的16进制字符串
     * @return {
     *  header:string,              帧头
     *  release:string,             序列号
     *  cmd:string,                 命令类型
     *  dataLength:int,             数据长度
     *  data:object,                数据或者错误消息
     *  crc:string                  crc16校验字符串
     *  state:true/false            正确与否,如果校验错误,或者获取数据失败,将在data里面写入错误信息
     * }
     */
    getData: function (targetStr) {
        //先按照协议读取相关数据,然后数据数据段读取完毕之后,再读取后面的CRC标识
        //如果先获取候最后两位进行CRC标记校验,可能存在数据风险
        if (typeof targetStr != "string") {
            targetStr = this.changeByte2HexStr(targetStr);
            console.log(targetStr)
           
        }
        var readByte = abUtil.readBytes(targetStr);
        var start = readByte(2);
        var xulie = readByte(1);
        var mingling = readByte(1);
        var dataLength = abUtil.toInt(readByte(4));
        var data = readByte(dataLength);
        var end = readByte(2);
        function checkCrc16() {
            var isOk = abUtil.checkCrc16(readByte.getAllData(), end);
            //给出的demo数据crc校验不通过
            if (!isOk) {
                return {
                    state: false,
                    data: "crc校验失败,数据有误"
                }
            }
            return {
                state: true
            }
        }

        function changeData(data) {
            try {
                // var _data = abUtil.hexCharCodeToStr(data)
                var _data = abUtil.hex2String2(data)
                return {
                    state: true,
                    data: JSON.parse(_data)
                }
            } catch (e) {
                console.log(e);
                return {
                    state: false,
                    data: "数据有误"
                }
            }
        }
        var result = checkCrc16();
        if (!result.state) {
            return result;
        }

        result = changeData(data);
        if (!result.state) {
            return result;
        }

        //设置数据
        result.header = "0x" + start;
        result.release = xulie;
        result.cmd = "0x" + mingling;
        result.dataLength = dataLength;
        result.crc = end;
        return result;
    },

    /**
     * 生成需要传递后端的数据项
     * 默认数据长度用4个字节表示
     * @param prefix :发送数据的前缀
     * @param targetJson: 需要发送的json数据
     * @param isBuffer :是否需要传递二进制的数据给后端
     * @param dataLength:数据字段保存的长度,默认4个字节
     * @return { state: true/false, data:字符串数据/字节数据组}
     */
    toHexStr: function (prefix, targetJson, isBuffer, dataLength) {
        dataLength = dataLength || 8;
        isBuffer = isBuffer || true;
        var jsonStr = JSON.stringify(targetJson);
        // console.log(jsonStr)
        //包含 0x开头字符串
        var length = this.to16Char(jsonStr.length);
        var charStr = this.string2hex2(jsonStr).toUpperCase();
        if (length.length > dataLength) {
            return {
                state: false,
                data: "数据长度超过规定的长度"
            }
        }
        //将长度填充为4个字节
        length = CRC.padLeft(length, dataLength);
        // var targetStr = prefix + length + charStr.substr(2, charStr.length)
        var targetStr = prefix + length + charStr

        var resultStr = targetStr + this.genCrc16(targetStr);
        console.log('**********send 16进制串')
        console.log(charStr)
        console.log(resultStr)


        /**
         * Node JS 只认buffer 需要arrayBugger 2 buffer
         */
        var arrayBuffer = this.getByteBuffer(resultStr).buffer;
        var buf = new Buffer(arrayBuffer.byteLength);
        var view = new Uint8Array(arrayBuffer);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }

        /**
         * Browser
         */

        return {
            state: true,
            data: isBuffer ? buf : resultStr
            // data: isBuffer ? this.getByteBuffer(resultStr) : resultStr
        }


    },
    /**
  * 读取蓝牙数据信息,蓝牙对数据的获取直接是进行数据处理
  * 对于数据时定长的,直接按位读取数据,对于数据不定长的
  * 通过长度以及数据段的定长长度,求其余数据段的长度
  * 比如 3.5.1鉴权码下行
  * @param {二进制字符数据}} arrayBuffer 
  * @returns {reader:读取器,如  reader(1) 读取一位hex字符,start:开始,xulie:序号,mingling,命令字符}
  * @param {dataLength} 数据段的字节数
  */
    readBlooth(bufferOrHexStr, dataLength) {
        dataLength = dataLength || 1;
        //将buffer数据转换为16进制字符串
        if (typeof bufferOrHexStr != "string") {
            bufferOrHexStr = this.changeByte2HexStr(bufferOrHexStr);
        }
        var readByte = abUtil.readBytes(bufferOrHexStr);
        var start = readByte(2);
        var xulie = readByte(1);
        var mingling = readByte(1);
        var dataLength = readByte(dataLength);
        return {
            reader: readByte,
            start: start,
            xulie: xulie,
            mingling: mingling,
            dataLength: dataLength
        }
    },
    /**
     * 将数据写入buffer中
     * @param prefix 前缀
     * @param targetHex 数据段子的16进制字符串 0X0101 -- 16进制的字符串
     * @param isBuffer 是否需要转换为buffer
     * @param dataLength 数据长度存储的字符串长度
     */
    writeBooth(prefix, targetHex, dataLength, isBuffer = false) {
        dataLength = dataLength || 2;
        //包含 0x开头字符串
        //传递的数据直接是二进制数据,求其字节长度的时候,需要将其hex/2
        const data_length = (targetHex.length) / 2;
        var length = this.to16Char(data_length);
        var charStr = targetHex.toUpperCase();
        if (length.length > dataLength) {
            return {
                state: false,
                data: "数据长度超过规定的长度"
            }
        }
        //字段长度进行填充(蓝牙协议是2个字节)
        length = CRC.padLeft(length, dataLength);
        var targetStr = prefix + length + charStr;
        var resultStr = targetStr + this.genCrc16(targetStr);
        return {
            state: true,
            data: isBuffer ? this.getByteBuffer(resultStr) : resultStr
        }
    },


    /**
     * 返回二进制的数据结构
     */
    getByteBuffer: function (hexStr) {
        var buff = new ArrayBuffer((hexStr.length) / 2);
        var bytes = new Int8Array(buff);
        var index = -1;
        for (var i in hexStr) {
            if (i % 2 == 0 && i != 0) {
                str = "0x" + hexStr.substr(i - 2, 2);
                bytes[++index] = str;
            }
        }
        str = "0x" + hexStr.substr(hexStr.length - 2, 2);
        bytes[++index] = str;
        return new DataView(buff);
    },
    /**
     * 将字节转换为16进制的字符串
     */
    changeByte2HexStr(arrayBuffer) {
        // Node 和 Broswer 的差异
        // console.log(arrayBuffer.byteLength)

        // var ab = new ArrayBuffer(arrayBuffer.length)
        // var view = new Uint8Array(ab);
        // for (var i = 0; i < arrayBuffer.length; ++i) {
        //     view[i] = arrayBuffer[i];
        // }
        // var dataView = new DataView(ab);
        // var hexStr = "";
        // var index = 0
        var dataView = new DataView(arrayBuffer);
        var hexStr = "";
        var index = 0
        while (index < dataView.byteLength) {
            // 序列号
            // console.log(index, dataView.getUint8(index).toString(16))
            if (dataView.getUint8(index).toString(16).length == 1) {
                hexStr += (0 + dataView.getUint8(index).toString(16))
                // console.log(index, dataView.getUint8(index).toString(16))
            } else {
                hexStr += dataView.getUint8(index).toString(16)
            }
            // if (index == 2 || index == 4 || index == 5 || index == 6 || index == 7) {
            //     if (dataView.getUint8(index).toString(16).length == 1) {
            //         hexStr += (0 + dataView.getUint8(index).toString(16))
            //     } else {
            //         hexStr += dataView.getUint8(index).toString(16);
            //     }
            // } else {
            //     hexStr += dataView.getUint8(index).toString(16);
            // }


            index++;
        }
        // console.log(hexStr.toUpperCase())
        return hexStr.toUpperCase();
    },
    /**
     * 字符串转16进制数据
     */
    strToHexCharCode: function (str) {
        if (str === "")
            return "";
        var hexCharCode = [];
        hexCharCode.push("0x");
        for (var i = 0; i < str.length; i++) {
            hexCharCode.push((str.charCodeAt(i)).toString(16));
        }
        return hexCharCode.join("");
    },
    /**
     * 16进制数据转字符串
     */
    hexCharCodeToStr: function (hexCharCodeStr) {
        var trimedStr = hexCharCodeStr.trim();
        var rawStr =
            trimedStr.substr(0, 2).toLowerCase() === "0x" ?
                trimedStr.substr(2) :
                trimedStr;
        var len = rawStr.length;

        if (len % 2 !== 0) {
            throw "数据格式有误"
        }
        var curCharCode;
        var resultStr = [];
        for (var i = 0; i < len; i = i + 2) {
            curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
            resultStr.push(String.fromCharCode(curCharCode));
        }
        return resultStr.join("");
    },
    /**
     * 读取16进制中的数据信息,传递参数16进制的字符串
     * 使用闭包,安装协议的长度读取协议数据
     * @param {目标16进制数据}} target 
     */
    readBytes: function (target) {
        var _target = target;
        var _length = 0;
        /**
         * 如果开始为0x标记,则过滤掉开始标记
         */
        if (_target.indexOf("0x") == 0) {
            _target = _target.substr(2, target.length);
        }

        var readyCall = function (length) {
            var charStr = _target.substr(_length * 2, length * 2);
            _length += length;
            return charStr;
        }

        //获取除除了CRC校验的所有数据内容项
        readyCall.getAllData = function () {
            return _target.substr(0, (_length - 2) * 2);
        };

        //通过限定开始和结束位置,自定义读取数据
        readyCall.getDataBySnap = function (start, end) {
            start = start || 0;
            end = end || _target.length;
            return _target.substr(start, end);
        }
        return readyCall;
    },

    /**
     * 
     * @param {16进制字符串不包含0x}} charStr 
     */
    toInt: function (charStr) {
        // return parseInt(Number(charStr), 16);   
        return parseInt(charStr, 16)
    },
    /**
     * 转换为16进制字符串
     */
    to16Char: function (charStr) {

        return Number(charStr).toString(16)
    },
    /**
     * 生成CRC校验
     */
    genCrc16: function (data) {
        return CRC.ToCRC16(data);
    },
    /**
     * 检查CRC校验的结果是否正确
     */
    checkCrc16: function (data, chart) {
        return CRC.ToCRC16(data) == chart;
    },


    hex2String2: function (b) {
        var strInput = b
        var nInputLength = strInput.length;
        if (nInputLength % 2 == 0) //当输入够偶数位；
        {
            var StrHex = "";
            for (var i = 0; i < nInputLength; i = i + 2) {
                var str = strInput.substr(i, 2); //16进制；
                //StrHex = StrHex + .toString(16);
                var n = parseInt(str, 16); //10进制；
                StrHex = StrHex + String.fromCharCode(n);
            }
            var jsonStr = decodeURIComponent(escape(StrHex))
            return jsonStr;
        }
    },

    string2hex2: function (str) {
        let arr = Array.from(str)
        return arr.map(c =>
            c.charCodeAt(0) < 128 ? c.charCodeAt(0).toString(16).length == 1 ? "0" + c.charCodeAt(0).toString(16) : c.charCodeAt(0).toString(16) : encodeURIComponent(c).replace(/\%/g, '').toLowerCase()).join('');
    }



}

var CRC = {};

CRC._auchCRCHi = [
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0,
    0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1,
    0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1,
    0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40,
    0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1,
    0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40,
    0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0,
    0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40, 0x00, 0xC1, 0x81, 0x40,
    0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1,
    0x81, 0x40, 0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41,
    0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0,
    0x80, 0x41, 0x00, 0xC1, 0x81, 0x40
];
CRC._auchCRCLo = [
    0x00, 0xC0, 0xC1, 0x01, 0xC3, 0x03, 0x02, 0xC2, 0xC6, 0x06,
    0x07, 0xC7, 0x05, 0xC5, 0xC4, 0x04, 0xCC, 0x0C, 0x0D, 0xCD,
    0x0F, 0xCF, 0xCE, 0x0E, 0x0A, 0xCA, 0xCB, 0x0B, 0xC9, 0x09,
    0x08, 0xC8, 0xD8, 0x18, 0x19, 0xD9, 0x1B, 0xDB, 0xDA, 0x1A,
    0x1E, 0xDE, 0xDF, 0x1F, 0xDD, 0x1D, 0x1C, 0xDC, 0x14, 0xD4,
    0xD5, 0x15, 0xD7, 0x17, 0x16, 0xD6, 0xD2, 0x12, 0x13, 0xD3,
    0x11, 0xD1, 0xD0, 0x10, 0xF0, 0x30, 0x31, 0xF1, 0x33, 0xF3,
    0xF2, 0x32, 0x36, 0xF6, 0xF7, 0x37, 0xF5, 0x35, 0x34, 0xF4,
    0x3C, 0xFC, 0xFD, 0x3D, 0xFF, 0x3F, 0x3E, 0xFE, 0xFA, 0x3A,
    0x3B, 0xFB, 0x39, 0xF9, 0xF8, 0x38, 0x28, 0xE8, 0xE9, 0x29,
    0xEB, 0x2B, 0x2A, 0xEA, 0xEE, 0x2E, 0x2F, 0xEF, 0x2D, 0xED,
    0xEC, 0x2C, 0xE4, 0x24, 0x25, 0xE5, 0x27, 0xE7, 0xE6, 0x26,
    0x22, 0xE2, 0xE3, 0x23, 0xE1, 0x21, 0x20, 0xE0, 0xA0, 0x60,
    0x61, 0xA1, 0x63, 0xA3, 0xA2, 0x62, 0x66, 0xA6, 0xA7, 0x67,
    0xA5, 0x65, 0x64, 0xA4, 0x6C, 0xAC, 0xAD, 0x6D, 0xAF, 0x6F,
    0x6E, 0xAE, 0xAA, 0x6A, 0x6B, 0xAB, 0x69, 0xA9, 0xA8, 0x68,
    0x78, 0xB8, 0xB9, 0x79, 0xBB, 0x7B, 0x7A, 0xBA, 0xBE, 0x7E,
    0x7F, 0xBF, 0x7D, 0xBD, 0xBC, 0x7C, 0xB4, 0x74, 0x75, 0xB5,
    0x77, 0xB7, 0xB6, 0x76, 0x72, 0xB2, 0xB3, 0x73, 0xB1, 0x71,
    0x70, 0xB0, 0x50, 0x90, 0x91, 0x51, 0x93, 0x53, 0x52, 0x92,
    0x96, 0x56, 0x57, 0x97, 0x55, 0x95, 0x94, 0x54, 0x9C, 0x5C,
    0x5D, 0x9D, 0x5F, 0x9F, 0x9E, 0x5E, 0x5A, 0x9A, 0x9B, 0x5B,
    0x99, 0x59, 0x58, 0x98, 0x88, 0x48, 0x49, 0x89, 0x4B, 0x8B,
    0x8A, 0x4A, 0x4E, 0x8E, 0x8F, 0x4F, 0x8D, 0x4D, 0x4C, 0x8C,
    0x44, 0x84, 0x85, 0x45, 0x87, 0x47, 0x46, 0x86, 0x82, 0x42,
    0x43, 0x83, 0x41, 0x81, 0x80, 0x40
];

CRC.CRC16 = function (buffer) {
    var crcId = 0,
        crc_l = 0xff,
        crc_h = 0xff;
    var crcValue = 0xffff;
    for (var i = 0; i < buffer.length; i++) {
        crcId = crc_h ^ buffer[i];
        crc_h = crc_l ^ CRC._auchCRCHi[crcId];
        crc_l = CRC._auchCRCLo[crcId];
        crcValue = (crc_h << 8) | crc_l;
    }
    return crcValue;
}

CRC.toInt = function (charStr) {
    return parseInt(charStr, 16);
}

/**
* 转换为16进制字符串
*/
CRC.to16Char = function (intStr) {
    const ch16Str = Number(intStr).toString(16);
    if (ch16Str.length % 2 == 0) {
        return ch16Str;
    }
    return "0" + ch16Str;
}

/**
 * 获取CRC16 Module- X16+X15+X10+2 的校验值,返回值为 低位+高位
 */
CRC.ToCRC16 = function ToCRC16(hexStr) {
    if (hexStr.indexOf("0x") == 0) {
        hexStr = hexStr.substring(2, hexStr.length);
    }
    var buffer = [];
    var index = 0;
    while (index < hexStr.length) {
        if (index % 2 == 0) {
            buffer.push(CRC.toInt(hexStr.substring(index, index + 2)));
        }
        index++;
    }
    var crc = CRC.to16Char(CRC.CRC16(buffer))
    var prefix = crc.substring(2, 4);
    var after = crc.substring(0, 2);
    return (prefix + after).toUpperCase();
}

CRC.padLeft = function (s, w, pc) {
    if (pc == undefined) {
        pc = '0';
    }
    for (var i = 0, c = w - s.length; i < c; i++) {
        s = pc + s;
    }
    return s;
};

function test() {

    var target = {
        "name": "张翔",
        "obj": "2",
    }
    console.log("------*使用原数据发送的数据*-----");
    var sendByte = abUtil.toHexStr("7E7E3D11", target, true);
    console.log(sendByte);
    console.log("------*开始数据解析*-----");
    var data = abUtil.getData(sendByte.data.buffer);
    console.log("------*接收的数据*-----");
    console.log(data);


}
test();

module.exports.abUtil = abUtil;