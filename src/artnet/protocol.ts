import { OP_OUTPUT } from './opcodes';

const ARTNET_HEADER = Buffer.from([65, 114, 116, 45, 78, 101, 116, 0]);

// Encoding and decoding of ArtNet packets. For a full protocol description, see:
// https://artisticlicence.com/WebSiteMaster/User%20Guides/art-net.pdf

export class ArtNetPacket {

    opcode = 0;

    toString() {
        let parameters = JSON.stringify(this);
        parameters = parameters.replace('"', '');
        parameters = parameters.replace(':', '=');
        return this.constructor.name + " " + parameters;
    }

    encode() {
        const opcodeBuffer = Buffer.alloc(2);
        opcodeBuffer.writeUInt16LE(this.opcode);
        return Buffer.concat([ARTNET_HEADER, opcodeBuffer])
    }
}

export class ArtDmx extends ArtNetPacket {

    opcode = OP_OUTPUT;
    protocolVersion: number;
    sequence: number;
    physical: number;
    universe: number;
    data: number[] | Uint8Array;

    constructor(protocolVersion: number, sequence: number, physical: number, universe: number, data: number[] | Uint8Array) {
        super();
        this.protocolVersion = protocolVersion;
        this.sequence = sequence;
        this.physical = physical;
        this.universe = universe;
        this.data = data;
    }

    isSequenceEnabled() {
        return this.sequence !== 0;
    }

    static decode(data: Buffer) {
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

    encode() {
        const header = super.encode();
        const buffer = Buffer.alloc(8 + this.data.length);
        buffer.writeUInt16BE(this.protocolVersion, 0);
        buffer.writeUInt8(this.sequence, 2);
        buffer.writeUInt8(this.physical, 3);
        buffer.writeUInt16LE(this.universe, 4);
        buffer.writeUInt16BE(this.data.length, 6);
        for (let i = 0; i < this.data.length; i++) {
            buffer.writeUInt8(this.data[i], 8 + i);
        }
        return Buffer.concat([header, buffer]);
    }
}

export function decode(msg: Buffer): ArtNetPacket | null {
    if (msg.length < 10) {
        return null;
    }
    if (msg.toString('ascii', 0, 7) !== 'Art-Net') {
        return null;
    }
    const opCode = msg.readUInt16LE(8);
    const packetData = msg.subarray(10);
    switch (opCode) {
        case OP_OUTPUT:
            return ArtDmx.decode(packetData);

        default:
            return null;
    }
}
