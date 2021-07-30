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
exports.start = void 0;
const node_hue_api_1 = require("node-hue-api");
const hue_dtls_1 = require("./hue-dtls");
const controller_1 = require("./artnet/controller");
const bridge_1 = require("./bridge");
function start(host, username, clientKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const bridge = new bridge_1.ArtNetHueBridge({
            hueHost: host,
            hueUsername: username,
            hueClientKey: clientKey,
            entertainmentRoomId: 6,
            artNetBindIp: '172.24.136.16',
            lights: [
                {
                    dmxStart: 1,
                    lightId: '10',
                    channelMode: '8bit-dimmable',
                },
                {
                    dmxStart: 5,
                    lightId: '11',
                    channelMode: '8bit',
                },
                {
                    dmxStart: 8,
                    lightId: '12',
                    channelMode: '16bit',
                },
            ]
        });
        yield bridge.start();
        return;
        console.log('Connecting to Hue bridge...');
        const api = yield node_hue_api_1.v3.api.createLocal(host).connect(username);
        const entertainment = yield api.groups.getEntertainment();
        const dtlsController = new hue_dtls_1.HueDtlsController(host, username, clientKey);
        dtlsController.on('close', () => {
            process.exit(0);
        });
        console.log('Requesting streaming mode...');
        const streamingResponse = yield api.groups.enableStreaming(entertainment[0].id);
        console.log('Streaming enabled:', streamingResponse);
        console.log('Sleeping for 3s to give the Hue bridge time to enable streaming mode');
        // Short delay because it can take some time for the Hue bridge to start
        // listening on the DTLS port.
        yield new Promise((resolve) => setTimeout(resolve, 3000));
        console.log('Performing streaming mode handshake...');
        yield dtlsController.connect();
        console.log('Starting ArtNet listener...');
        let running = true;
        // TODO: Multiple control modes:
        //   - RGB 8bit (Upscale to 16bit)
        //   - RGB 8bit + dimmer (We use the dimmer for a full 16bit value)
        //   - RGB 16bit (Full control)
        // TODO: Keepalive to Hue when no Artnet is received
        // TODO: Shutdown handler
        const artNetListener = new controller_1.ArtNetController();
        artNetListener.bind('127.0.0.1');
        artNetListener.on('dmx', (data) => {
            if (!running) {
                return;
            }
            dtlsController.sendUpdate([
                { lightId: 10, color: [data.data[0], data.data[1], data.data[2]] },
                // {lightId: 2, color: [data.data[3], data.data[4], data.data[5]]},
            ]);
        });
        process.on('SIGINT', () => {
            running = false;
            console.log('  Closing Hue Entertainment connection...');
            dtlsController.close().then(() => {
                console.log('Done');
                process.exit(0);
            });
        });
    });
}
exports.start = start;
//# sourceMappingURL=artnet.js.map