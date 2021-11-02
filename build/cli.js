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
        this.args = args;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.args.length === 0) {
                this.printHelp();
                return;
            }
            if (this.args[0] === 'discover') {
                this.discoverBridges();
            }
            else if (this.args[0] === 'pair') {
                this.runPair(this.args.slice(1));
            }
            else if (this.args[0] === 'run') {
                this.startProcess();
            }
            else if (this.args[0] === 'config-path') {
                console.log(this.config.path);
            }
            else {
                this.printHelp();
                return;
            }
        });
    }
    printHelp() {
        console.log('Usage: artnet-hue-entertainment <discover|pair|config-path|run> [options]');
        console.log('');
        console.log('Control Philips/Signify Hue lights using ArtNet.');
        console.log('');
        console.log('Subcommands:');
        console.log('  discover             Discover all Hue bridges on your network. When you know the IP address of the bridge, run \'pair\' directly.');
        console.log('  pair                 Pair with a Hue bridge. Press the link button on the bridge before running');
        console.log('    --ip               The IP address of the Hue bridge. Both IPv4 and IPv6 are supported.');
        console.log('  config-path          Print the path to the configuration file, for manual editing.');
        console.log('  run                  Run the ArtNet to Hue bridge.');
        process.exit(1);
    }
    runPair(argv) {
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
                    console.error('Error while pairing:', e._hueError.payload.message);
                    process.exit(1);
                }
                throw e;
            }
        });
    }
    discoverBridges() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Discovering bridges...');
            node_hue_api_1.discovery.nupnpSearch().then(results => {
                if (results.length === 0) {
                    console.log('No bridges found.');
                    return;
                }
                console.log('Found bridges:');
                results.forEach(bridge => {
                    var _a;
                    console.log(` - ${bridge.ipaddress}: ${(_a = bridge.config) === null || _a === void 0 ? void 0 : _a.name}`);
                });
                console.log('');
                console.log('To use any of these bridges, press the link button on the bridge and run:');
                console.log('$ artnet-hue-entertainment pair --ip <ip address>');
            });
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