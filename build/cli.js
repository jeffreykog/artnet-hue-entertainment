#!/usr/bin/env node
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
const source_1 = require("conf/dist/source");
const minimist = require("minimist");
const node_hue_api_1 = require("node-hue-api");
const bridge_1 = require("./bridge");
class ArtNetHueEntertainmentCliHandler {
    constructor(args) {
        this.config = new source_1.default();
        console.log(this.config.path);
        this.args = args;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.args.length === 0) {
                this.printHelp();
                return;
            }
            if (this.args[0] === 'setup') {
                this.runSetup(this.args.slice(1));
            }
            else if (this.args[0] === 'run') {
                this.startProcess();
            }
            else {
                this.printHelp();
                return;
            }
        });
    }
    printHelp() {
        console.log('Help');
        process.exit(1);
    }
    runSetup(argv) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = minimist(argv, {
                string: ['ip'],
            });
            if (!('ip' in args) || args.ip.length === 0) {
                // TODO: Print help
                process.exit(1);
                return;
            }
            // TODO: Validate IP
            try {
                const host = args.ip;
                const api = yield node_hue_api_1.v3.api.createLocal(host).connect();
                const user = yield api.users.createUser('artnet-hue-entertainment', 'cli');
                this.config.set('hue.host', host);
                this.config.set('hue.username', user.username);
                this.config.set('hue.clientKey', user.clientkey);
                console.log('Hue setup was successful! Credentials are saved. You can run the server now.');
            }
            catch (e) {
                if (e._hueError) {
                    console.error(e._hueError.payload.message);
                    process.exit(1);
                }
                throw e;
            }
        });
    }
    startProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Detect when setup has not yet been run
            const host = this.config.get('hue.host');
            const username = this.config.get('hue.username');
            const clientKey = this.config.get('hue.clientKey');
            const bridge = new bridge_1.ArtNetHueBridge({
                hueHost: host,
                hueUsername: username,
                hueClientKey: clientKey,
                entertainmentRoomId: 6,
                artNetBindIp: '172.24.142.110',
                lights: [
                    {
                        dmxStart: 1,
                        lightId: '10',
                        channelMode: '8bit-dimmable',
                    },
                    // {
                    //     dmxStart: 5,
                    //     lightId: '11',
                    //     channelMode: '8bit-dimmable',
                    // },
                ]
            });
            yield bridge.start();
        });
    }
}
const handler = new ArtNetHueEntertainmentCliHandler(process.argv.slice(2));
handler.run();
//# sourceMappingURL=cli.js.map