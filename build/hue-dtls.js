"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HueDtlsController = void 0;
const node_dtls_client_1 = require("node-dtls-client");
const events_1 = require("events");
const PACKET_HEADER = Buffer.from([0x48, 0x75, 0x65, 0x53, 0x74, 0x72, 0x65, 0x61, 0x6d]);
class HueDtlsController extends events_1.EventEmitter {
    constructor(host, username, clientKey) {
        super();
        this.port = 2100;
        this.socket = null;
        this.opened = false;
        this.skip = false;
        this.lastUpdate = null;
        this.lastUpdateTimestamp = null;
        this.updateKeepaliveTimeout = null;
        this.host = host;
        this.username = username;
        this.clientKey = clientKey;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const dtlsConfig = {
                type: 'udp4',
                port: this.port,
                address: this.host,
                psk: { [this.username]: Buffer.from(this.clientKey, 'hex') },
                ciphers: [
                    'TLS_PSK_WITH_AES_128_GCM_SHA256',
                ],
                timeout: 1000,
            };
            const socket = yield node_dtls_client_1.dtls.createSocket(dtlsConfig);
            socket.on('connected', () => {
                this.opened = true;
                this.emit('connected');
            });
            socket.on('close', () => {
                this.close();
            });
            this.updateKeepaliveTimeout = setInterval(this.updateKeepalive.bind(this), 1000);
            this.socket = socket;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.opened) {
                return;
            }
            this.opened = false;
            yield new Promise(resolve => { var _a; return (_a = this.socket) === null || _a === void 0 ? void 0 : _a.close(() => resolve(undefined)); });
            this.emit('close');
        });
    }
    sendUpdate(updates) {
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
    updateKeepalive() {
        if (this.lastUpdateTimestamp !== null && Date.now() - this.lastUpdateTimestamp.getTime() <= 2000) {
            return;
        }
        if (this.lastUpdate) {
            this.sendUpdatePacket(this.lastUpdate);
        }
    }
    sendUpdatePacket(updates) {
        var _a;
        const message = Buffer.alloc(16 + (updates.length * 9), 0x00);
        PACKET_HEADER.copy(message, 0);
        message.writeUInt8(1, 9); // Major version
        message.writeUInt8(0, 10); // Minor version
        message.writeUInt8(0, 11); // Sequence. This is currently ignored
        message.writeUInt16BE(0, 12); // Reserved
        message.writeUInt8(0, 14); // Color space RGB
        message.writeUInt8(0, 15); // Reserved
        let offset = 16;
        updates.forEach(update => {
            message.writeUInt8(0, offset); // Device type: Light
            message.writeUInt16BE(update.lightId, offset + 1); // Light ID
            message.writeUInt16BE(update.color[0], offset + 3); // R
            message.writeUInt16BE(update.color[1], offset + 5); // G
            message.writeUInt16BE(update.color[2], offset + 7); // B
            offset += 9;
        });
        // console.log(message.toString('hex').match(/../g)!.join(' '));
        if (this.opened) {
            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(message);
        }
    }
}
exports.HueDtlsController = HueDtlsController;
//# sourceMappingURL=hue-dtls.js.map