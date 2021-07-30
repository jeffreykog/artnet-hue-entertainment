"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtNetController = void 0;
const protocol_1 = require("./protocol");
const dgram = require("dgram");
const ip6addr = require("ip6addr");
const os = require("os");
const events_1 = require("events");
const PORT = 6454;
class ArtNetController extends events_1.EventEmitter {
    constructor() {
        super();
        const interfaces = os.networkInterfaces();
        const prefixes = {};
        Object.entries(interfaces).forEach(([ifName, addresses]) => {
            if (!addresses) {
                return;
            }
            addresses.forEach(addressInfo => {
                prefixes[addressInfo.cidr] = ip6addr.createCIDR(addressInfo.cidr);
            });
        });
        this.interfacePrefixes = prefixes;
    }
    bind(host) {
        if (host === '0.0.0.0' || host === '::') {
            host = undefined;
        }
        let prefixInfo = undefined;
        let broadcastAddress = undefined;
        let unicastAddress = undefined;
        if (host != null) {
            Object.keys(this.interfacePrefixes).forEach((cidr) => {
                const prefix = this.interfacePrefixes[cidr];
                if (prefix.contains(host)) {
                    prefixInfo = prefix;
                }
            });
            if (prefixInfo) {
                broadcastAddress = prefixInfo.broadcast().toString();
                unicastAddress = host;
            }
            else {
                throw Error('Bind host ' + host + ' does not match any network interface');
            }
        }
        else {
            broadcastAddress = '0.0.0.0';
        }
        if (broadcastAddress !== null) {
            this.broadcastAddress = broadcastAddress;
            const socketBroadcast = dgram.createSocket({ type: 'udp4', reuseAddr: true });
            socketBroadcast.on('error', this.onSocketError);
            socketBroadcast.on('message', (message, rinfo) => {
                this.onSocketMessage('broadcast', message, rinfo);
            });
            socketBroadcast.on('listening', this.onSocketBroadcastListening.bind(this));
            socketBroadcast.bind(PORT, broadcastAddress);
            this.socketBroadcast = socketBroadcast;
        }
        if (unicastAddress !== null) {
            this.unicastAddress = unicastAddress;
            const socketUnicast = dgram.createSocket({ type: 'udp4', reuseAddr: true });
            socketUnicast.on('error', this.onSocketError);
            socketUnicast.on('message', (message, rinfo) => {
                this.onSocketMessage('unicast', message, rinfo);
            });
            socketUnicast.bind(PORT, unicastAddress);
            this.socketUnicast = socketUnicast;
        }
    }
    onSocketError(err) {
    }
    onSocketBroadcastListening() {
        if (this.socketBroadcast == null) {
            return;
        }
        this.socketBroadcast.setBroadcast(true);
    }
    onSocketMessage(socketType, msg, rinfo) {
        const packet = protocol_1.decode(msg);
        if (!packet) {
            return;
        }
        if (packet instanceof protocol_1.ArtDmx) {
            this.emit("dmx", packet);
        }
    }
}
exports.ArtNetController = ArtNetController;
//# sourceMappingURL=controller.js.map