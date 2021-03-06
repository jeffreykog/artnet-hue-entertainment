#!/usr/bin/env node
import Conf from 'conf/dist/source';
import * as minimist from 'minimist';
import { v3, discovery } from 'node-hue-api';
import { ArtNetHueBridge } from './bridge';

class ArtNetHueEntertainmentCliHandler {

    private readonly config: Conf;
    private readonly args: string[];

    constructor(args: string[]) {
        this.config = new Conf();
        this.args = args;
    }

    async run() {
        if (this.args.length === 0) {
            this.printHelp();
            return;
        }

        if (this.args[0] === 'discover') {
            await this.discoverBridges();
        } else if (this.args[0] === 'pair') {
            await this.runPair(this.args.slice(1));
        } else if (this.args[0] === 'run') {
            await this.startProcess();
        } else if (this.args[0] === 'config-path') {
            console.log(this.config.path);
        } else {
            this.printHelp();
            return;
        }
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

    async runPair(argv: string[]) {
        const args = minimist(argv, {
            string: ['ip'],
        });

        if (!('ip' in args) || args.ip.length === 0) {
            // TODO: Print help
            process.exit(1);
            return;
        }

        try {
            const host: string = args.ip;
            const api = await v3.api.createLocal(host).connect();
            const user = await api.users.createUser('artnet-hue-entertainment', 'cli');

            this.config.set('hue.host', host);
            this.config.set('hue.username', user.username);
            this.config.set('hue.clientKey', user.clientkey);

            console.log('Hue setup was successful! Credentials are saved. You can run the server now.')

        } catch (e) {
            if (e._hueError) {
                console.error('Error while pairing:', e._hueError.payload.message);
                process.exit(1);
            }
            throw e;
        }
    }

    async discoverBridges() {
        console.log('Discovering bridges...');
        discovery.nupnpSearch().then(results => {
            if (results.length === 0) {
                console.log('No bridges found.');
                return;
            }
            console.log('Found bridges:');
            results.forEach(bridge => {
                console.log(` - ${bridge.ipaddress}: ${bridge.config?.name}`);
            });
            console.log('');
            console.log('To use any of these bridges, press the link button on the bridge and run:');
            console.log('$ artnet-hue-entertainment pair --ip <ip address>');
        });
    }

    async startProcess() {
        // TODO: Detect when setup has not yet been run
        const host = this.config.get('hue.host') as string;
        const username = this.config.get('hue.username') as string;
        const clientKey = this.config.get('hue.clientKey') as string;
        if (host === undefined || username === undefined || clientKey === undefined) {
            console.log('No Hue bridge is paired yet. Please pair a bridge first');
            return;
        }

        const bridge = new ArtNetHueBridge({
            hueHost: host,
            hueUsername: username,
            hueClientKey: clientKey,
            entertainmentRoomId: 200,
            artNetBindIp: '172.24.184.16',
            lights: [
                {
                    dmxStart: 1,
                    lightId: '31',
                    channelMode: '8bit-dimmable',
                },
                {
                    dmxStart: 5,
                    lightId: '32',
                    channelMode: '8bit-dimmable',
                },
                {
                    dmxStart: 9,
                    lightId: '33',
                    channelMode: '8bit-dimmable',
                },
                {
                    dmxStart: 13,
                    lightId: '34',
                    channelMode: '8bit-dimmable',
                },
                // {
                //     dmxStart: 5,
                //     lightId: '11',
                //     channelMode: '8bit-dimmable',
                // },
            ]
        });
        await bridge.start();
    }
}

const handler = new ArtNetHueEntertainmentCliHandler(process.argv.slice(2));
handler.run();
