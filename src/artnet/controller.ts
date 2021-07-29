import { RemoteInfo, Socket } from 'dgram';
import { ArtDmx, decode } from './protocol';
import * as dgram from 'dgram';
import * as ip6addr from 'ip6addr';
import * as os from 'os';
import { EventEmitter } from 'events';

const PORT = 6454;

export class ArtNetController extends EventEmitter {

    private readonly interfacePrefixes: { [key: string]: ip6addr.CIDR };
    socketUnicast?: Socket;
    socketBroadcast?: Socket;

    private broadcastAddress?: string;
    private unicastAddress?: string;

    constructor() {
        super();

        const interfaces = os.networkInterfaces();
        const prefixes: { [key: string]: ip6addr.CIDR }  = {};
        Object.entries(interfaces).forEach(([ifName, addresses]) => {
            if (!addresses) {
                return;
            }
            addresses.forEach(addressInfo => {
                prefixes[addressInfo.cidr as string] = ip6addr.createCIDR(addressInfo.cidr as string);
            });
        });
        this.interfacePrefixes = prefixes;
    }

    public bind(host?: string) {
        if (host === '0.0.0.0' || host === '::') {
            host = undefined;
        }
        let prefixInfo: ip6addr.CIDR | undefined = undefined;
        let broadcastAddress: string | undefined = undefined;
        let unicastAddress: string | undefined = undefined;
        if (host != null) {
            Object.keys(this.interfacePrefixes).forEach((cidr) => {
                const prefix = this.interfacePrefixes[cidr];
                if (prefix.contains(host as string)) {
                    prefixInfo = prefix;
                }
            });
            if (prefixInfo) {
                broadcastAddress = (prefixInfo as ip6addr.CIDR).broadcast().toString();
                unicastAddress = host;
            } else {
                throw Error('Bind host ' + host + ' does not match any network interface')
            }
        } else {
            broadcastAddress = '0.0.0.0';
        }

        if (broadcastAddress !== null) {
            this.broadcastAddress = broadcastAddress;
            const socketBroadcast = dgram.createSocket({type: 'udp4', reuseAddr: true});
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
            const socketUnicast = dgram.createSocket({type: 'udp4', reuseAddr: true});
            socketUnicast.on('error', this.onSocketError);
            socketUnicast.on('message', (message, rinfo) => {
                this.onSocketMessage('unicast', message, rinfo);
            });
            socketUnicast.bind(PORT, unicastAddress);
            this.socketUnicast = socketUnicast;
        }
    }

    private onSocketError(err: Error) {

    }

    private onSocketBroadcastListening() {
        if (this.socketBroadcast == null) {
            return;
        }
        this.socketBroadcast.setBroadcast(true);
    }

    private onSocketMessage(socketType: string, msg: Buffer, rinfo: RemoteInfo) {
        const packet = decode(msg);
        if (!packet) {
            return;
        }

        if (packet instanceof ArtDmx) {
            this.emit("dmx", packet);
        }
    }
}
