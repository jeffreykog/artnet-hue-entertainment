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
exports.ArtNetHueBridge = void 0;
const node_hue_api_1 = require("node-hue-api");
const const_1 = require("./const");
const hue_dtls_1 = require("./hue-dtls");
const controller_1 = require("./artnet/controller");
class DmxLight {
    constructor(dmxStart, lightId) {
        this.dmxStart = dmxStart;
        this.lightId = lightId;
    }
}
class DmxLight8Bit extends DmxLight {
    constructor() {
        super(...arguments);
        this.channelWidth = 3;
    }
    getColorValue(dmxValues) {
        const r = (dmxValues[0] * 257);
        const g = (dmxValues[1] * 257);
        const b = (dmxValues[2] * 257);
        return [r, g, b];
    }
}
class DmxLight8BitDimmable extends DmxLight {
    constructor() {
        super(...arguments);
        this.channelWidth = 4;
    }
    getColorValue(dmxValues) {
        const r = (dmxValues[1] * 257) * (dmxValues[0] / 255);
        const g = (dmxValues[2] * 257) * (dmxValues[0] / 255);
        const b = (dmxValues[3] * 257) * (dmxValues[0] / 255);
        return [r, g, b];
    }
}
class DmxLight16Bit extends DmxLight {
    constructor() {
        super(...arguments);
        this.channelWidth = 6;
    }
    getColorValue(dmxValues) {
        const r = dmxValues[0];
        const rFine = dmxValues[1];
        const g = dmxValues[2];
        const gFine = dmxValues[3];
        const b = dmxValues[4];
        const bFine = dmxValues[5];
        return [(r << 8) + rFine, (g << 8) + gFine, (b << 8) + bFine];
    }
}
const LIGHT_MODES = {
    [const_1.LIGHT_MODE_8BIT]: DmxLight8Bit,
    [const_1.LIGHT_MODE_8BIT_DIMMABLE]: DmxLight8BitDimmable,
    [const_1.LIGHT_MODE_16BIT]: DmxLight16Bit,
};
class ArtNetHueBridge {
    constructor(configuration) {
        this.hueApi = null;
        this.lights = null;
        this.artNetController = null;
        this.dtlsController = null;
        this.configuration = configuration;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.hueApi = yield node_hue_api_1.v3.api.createLocal(this.configuration.hueHost)
                .connect(this.configuration.hueUsername);
            const entertainment = yield this.hueApi.groups.getEntertainment();
            const rooms = entertainment.filter(ent => ent.id === this.configuration.entertainmentRoomId);
            if (rooms.length !== 1) {
                throw new Error(`Entertainment room with id ${this.configuration.entertainmentRoomId} was not found`);
            }
            const room = rooms[0];
            let roomLightIds = room.lights;
            const lightConfigById = {};
            const lights = [];
            this.configuration.lights.forEach(light => {
                const idx = roomLightIds.indexOf(light.lightId);
                if (idx !== -1) {
                    roomLightIds.splice(idx, 1);
                }
                lightConfigById[light.lightId] = light;
                lights.push(new LIGHT_MODES[light.channelMode](light.dmxStart, parseInt(light.lightId, 10)));
            });
            if (roomLightIds.length !== 0) {
                throw new Error(`Not all lights in the Entertainment room have been configured`);
            }
            // TODO: Detect (and warn) overlapping DMX channels
            this.lights = lights;
            this.dtlsController = new hue_dtls_1.HueDtlsController(this.configuration.hueHost, this.configuration.hueUsername, this.configuration.hueClientKey);
            this.dtlsController.on('close', () => {
                process.exit(0);
            });
            this.artNetController = new controller_1.ArtNetController();
            this.artNetController.bind(this.configuration.artNetBindIp);
            this.artNetController.on('dmx', this.onDmxData.bind(this));
            console.log('Requesting streaming mode...');
            const streamingResponse = yield this.hueApi.groups.enableStreaming(this.configuration.entertainmentRoomId);
            console.log('Streaming enabled:', streamingResponse);
            console.log('Sleeping for 3s to give the Hue bridge time to enable streaming mode');
            // Short delay because it can take some time for the Hue bridge to start
            // listening on the DTLS port.
            yield new Promise((resolve) => setTimeout(resolve, 3000));
            console.log('Performing streaming mode handshake...');
            yield this.dtlsController.connect();
            console.log('Connected and ready to go!');
            // process.on('SIGINT', () => {
            //     console.log('  Closing Hue Entertainment connection...');
            //     this.dtlsController.close().then(() => {
            //         console.log('Done');
            //         process.exit(0);
            //     });
            // });
        });
    }
    onDmxData(dmx) {
        var _a;
        const colorUpdates = [];
        this.lights.forEach(light => {
            const dmxData = dmx.data.slice(light.dmxStart - 1, (light.dmxStart - 1) + light.channelWidth);
            const colors = light.getColorValue(dmxData);
            colorUpdates.push({ lightId: light.lightId, color: colors });
        });
        (_a = this.dtlsController) === null || _a === void 0 ? void 0 : _a.sendUpdate(colorUpdates);
    }
}
exports.ArtNetHueBridge = ArtNetHueBridge;
//# sourceMappingURL=bridge.js.map