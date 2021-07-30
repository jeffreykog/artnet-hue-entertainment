import { dtls } from 'node-dtls-client';
import { EventEmitter } from 'events';
import Timeout = NodeJS.Timeout;

const PACKET_HEADER = Buffer.from([0x48, 0x75, 0x65, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d]);


export interface ColorUpdate {
    lightId: number;
    color: [number, number, number];
}


export class HueDtlsController extends EventEmitter {

    private readonly host: string;
    private readonly username: string;
    private readonly clientKey: string;
    private readonly port = 2100;

    private socket: dtls.Socket | null = null;

    private opened = false;
    private skip = false;

    private lastUpdate: ColorUpdate[] | null = null;
    private lastUpdateTimestamp: Date | null = null;
    private updateKeepaliveTimeout: Timeout | null = null;

    constructor(host: string, username: string, clientKey: string) {
        super();
        this.host = host;
        this.username = username;
        this.clientKey = clientKey;
    }

    async connect() {
        const dtlsConfig: any = {
            type: 'udp4',  // TODO: Detect ipv4/ipv6
            port: this.port,
            address: this.host,
            psk: { [this.username]: Buffer.from(this.clientKey, 'hex') },
            ciphers: [
                'TLS_PSK_WITH_AES_128_GCM_SHA256',
            ],
            timeout: 1000,
        };

        const socket = await dtls.createSocket(dtlsConfig)
        socket.on('connected', () => {
            this.opened = true;
            this.emit('connected');
        });
        socket.on('close', () => {
            this.close();
        });

        this.updateKeepaliveTimeout = setInterval(this.updateKeepalive.bind(this), 1000);

        this.socket = socket;
    }

    public async close() {
        this.opened = false;
        await new Promise(resolve => this.socket?.close(() => resolve(undefined)));
        this.emit('close');
    }

    public sendUpdate(updates: ColorUpdate[]) {
        if (this.socket === null || !this.opened) {
            return;
        }
        if (this.skip) {
            this.skip = false;
            return;
        }
        this.skip = true;
        this.lastUpdate = updates;
        this.lastUpdateTimestamp = new Date();

        // TODO: Perhaps validate the input?
        // TODO: Ensure there is 40ms between every call.

        this.sendUpdatePacket(updates);
    }

    private updateKeepalive() {
        if (this.lastUpdateTimestamp !== null && Date.now() - this.lastUpdateTimestamp.getTime() <= 2000) {
            return;
        }

        if (this.lastUpdate) {
            this.sendUpdatePacket(this.lastUpdate);
        }
    }

    private sendUpdatePacket(updates: ColorUpdate[]) {
        const message = Buffer.alloc(16 + (updates.length * 9), 0x00);
        PACKET_HEADER.copy(message, 0);
        message.writeUInt8(1, 9);  // Major version
        message.writeUInt8(0, 10);  // Minor version
        message.writeUInt8(0, 11);  // Sequence. This is currently ignored
        message.writeUInt16BE(0, 12);  // Reserved
        message.writeUInt8(0, 14);  // Color space RGB
        message.writeUInt8(0, 15);  // Reserved

        let offset = 16;
        updates.forEach(update => {
            message.writeUInt8(0, offset);  // Device type: Light
            message.writeUInt16BE(update.lightId, offset + 1);  // Light ID
            message.writeUInt16BE(update.color[0], offset + 3);  // R
            message.writeUInt16BE(update.color[1], offset + 5);  // G
            message.writeUInt16BE(update.color[2], offset + 7);  // B
            offset += 9;
        });

        // console.log(message.toString('hex').match(/../g)!.join(' '));

        this.socket?.send(message);
    }
}
