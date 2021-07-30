"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.ArtDmx = exports.ArtNetPacket = void 0;
const opcodes_1 = require("./opcodes");
const ARTNET_HEADER = Buffer.from([65, 114, 116, 45, 78, 101, 116, 0]);
// Encoding and decoding of ArtNet packets. For a full protocol description, see:
// https://artisticlicence.com/WebSiteMaster/User%20Guides/art-net.pdf
class ArtNetPacket {
    constructor() {
        this.opcode = 0;
    }
    toString() {
        let parameters = JSON.stringify(this);
        parameters = parameters.replace('"', '');
        parameters = parameters.replace(':', '=');
        return this.constructor.name + " " + parameters;
    }
}
exports.ArtNetPacket = ArtNetPacket;
class ArtDmx extends ArtNetPacket {
    constructor(protocolVersion, sequence, physical, universe, data) {
        super();
        this.opcode = opcodes_1.OP_OUTPUT;
        this.protocolVersion = protocolVersion;
        this.sequence = sequence;
        this.physical = physical;
        this.universe = universe;
        this.data = data;
    }
    isSequenceEnabled() {
        return this.sequence !== 0;
    }
    static decode(data) {
        const version = data.readUInt16BE(0);
        const sequence = data.readUInt8(2);
        const physical = data.readUInt8(3);
        const universe = data.readUInt16LE(4);
        const length = data.readUInt16BE(6);
        const dmxData = [];
        for (let i = 0; i < length; i++) {
            dmxData.push(data.readUInt8(8 + i));
        }
        return new ArtDmx(version, sequence, physical, universe, dmxData);
    }
}
exports.ArtDmx = ArtDmx;
function decode(msg) {
    if (msg.length < 10) {
        return null;
    }
    if (msg.toString('ascii', 0, 7) !== 'Art-Net') {
        return null;
    }
    const opCode = msg.readUInt16LE(8);
    const packetData = msg.subarray(10);
    switch (opCode) {
        case opcodes_1.OP_OUTPUT:
            return ArtDmx.decode(packetData);
        default:
            return null;
    }
}
exports.decode = decode;
//# sourceMappingURL=protocol.js.map