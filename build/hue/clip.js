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
exports.ClipApi = void 0;
const axios_1 = require("axios");
const https = require("https");
class ClipApi {
    constructor(host, username) {
        this.host = host;
        this.username = username;
        this.client = axios_1.default.create({
            baseURL: 'https://' + host,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            headers: {
                'hue-application-key': this.username,
            }
        });
    }
    getEntertainmentConfigurations() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.get('/clip/v2/resource/entertainment_configuration');
            return response.data.data;
        });
    }
    createEntertainmentConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield this.client.get('/clip/v2/resource/entertainment');
            console.log(r.data.data);
            const response = yield this.client.post('/clip/v2/resource/entertainment_configuration', {
                type: 'entertainment_configuration',
                metadata: {
                    name: 'Test',
                },
                configuration_type: 'screen',
                stream_proxy: {
                    mode: 'auto',
                },
                locations: {
                    service_locations: [
                        {
                            service: {
                                rtype: 'entertainment',
                                rid: '033914fd-1e15-48dc-bb86-6df325f37479',
                            },
                            position: { x: 0, y: 0, z: 0 },
                            positions: [
                                { x: 0, y: 0, z: 0 },
                            ]
                        }
                    ]
                }
            });
            console.log(response.status);
            console.log(response.data);
        });
    }
}
exports.ClipApi = ClipApi;
//# sourceMappingURL=clip.js.map