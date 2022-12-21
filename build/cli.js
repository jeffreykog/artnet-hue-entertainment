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
const minimist = require("minimist");
const node_hue_api_1 = require("node-hue-api");
const bridge_1 = require("./bridge");
const nconf = require("nconf");
const promises_1 = require("fs/promises");
const CONFIG_FILE_PATH = 'config.json';
class ArtNetHueEntertainmentCliHandler {
    constructor(args) {
        this.config = nconf.argv().env();
        this.args = args;
    }
    getIPAddress() {
        const interfaces = require('os').networkInterfaces();
        for (const devName in interfaces) {
            const iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
            }
        }
        return '0.0.0.0';
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkOrCreateConfigFile();
            // TODO: Handle config parsing errors
            this.config = this.config.file(CONFIG_FILE_PATH);
            if (this.args.length === 0) {
                this.printHelp();
                return;
            }
            console.log("Run mode passed via command line is <" + this.args[0] + ">");
            const runMode = this.args[0] === "from-config" ? this.config.get('run-mode') : this.args[0];
            console.log("Effective run mode is <" + runMode + ">");
            if (runMode === 'discover') {
                yield this.discoverBridges();
            }
            else if (runMode === 'pair') {
                const ip = this.args[0] === "from-config" ?
                    ["--ip", this.config.get('hue.host')]
                    : this.args.slice(1);
                yield this.runPair(ip);
            }
            else if (runMode === 'run') {
                yield this.startProcess();
            }
            else if (runMode === 'list-rooms') {
                yield this.listEntertainmentRooms();
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
        console.log('  list-rooms           List all available entertainment rooms');
        console.log('  run                  Run the ArtNet to Hue bridge.');
        console.log('  from-config          Use configuration setting "run-mode" from configuration file as parameter. For \'pair\', configuration entry \'hue.host\' is used for \'--ip\' ');
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
            try {
                const host = args.ip;
                const api = yield node_hue_api_1.v3.api.createLocal(host).connect();
                const user = yield api.users.createUser('artnet-hue-entertainment', 'cli');
                this.config.set('hue:host', host);
                this.config.set('hue:username', user.username);
                this.config.set('hue:clientKey', user.clientkey);
                this.config.save(null);
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
            const host = this.config.get('hue:host');
            const username = this.config.get('hue:username');
            const clientKey = this.config.get('hue:clientKey');
            const entertainmentRoomId = this.config.get('hue:entertainmentRoomId');
            const lights = this.config.get('lights');
            if (host === undefined || username === undefined || clientKey === undefined) {
                console.log('No Hue bridge is paired yet. Please pair a bridge first');
                return;
            }
            const bridge = new bridge_1.ArtNetHueBridge({
                hueHost: host,
                hueUsername: username,
                hueClientKey: clientKey,
                entertainmentRoomId: entertainmentRoomId,
                artNetBindIp: this.getIPAddress(),
                lights: lights,
            });
            yield bridge.start();
        });
    }
    listEntertainmentRooms() {
        return __awaiter(this, void 0, void 0, function* () {
            const hueApi = yield node_hue_api_1.v3.api.createLocal(this.config.get("hue:host"))
                .connect(this.config.get("hue:username"));
            const rooms = yield hueApi.groups.getEntertainment();
            rooms.forEach(room => {
                console.log(room);
            });
        });
    }
    checkOrCreateConfigFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let exists;
            const configFilePath = yield promises_1.realpath(CONFIG_FILE_PATH);
            console.log("Config file is probably <" + configFilePath + ">");
            try {
                const fileInfo = yield promises_1.stat(CONFIG_FILE_PATH);
                exists = fileInfo.isFile();
            }
            catch (e) {
                exists = false;
            }
            console.log("Config file exists " + exists);
            if (!exists) {
                const fd = yield promises_1.open(CONFIG_FILE_PATH, 'w');
                yield fd.write('{}');
                yield fd.close();
            }
        });
    }
}
const handler = new ArtNetHueEntertainmentCliHandler(process.argv.slice(2));
handler.run();
//# sourceMappingURL=cli.js.map