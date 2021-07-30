#!/usr/bin/env node
import Conf from 'conf/dist/source';
import * as minimist from 'minimist';
import { v3 } from 'node-hue-api';
import { ArtNetHueBridge } from './bridge';

class ArtNetHueEntertainmentCliHandler {

    private readonly config: Conf;
    private readonly args: string[];

    constructor(args: string[]) {
        this.config = new Conf();
        console.log(this.config.path);
        this.args = args;
    }

    async run() {
        if (this.args.length === 0) {
            this.printHelp();
            return;
        }

        if (this.args[0] === 'setup') {
            this.runSetup(this.args.slice(1));
        } else if (this.args[0] === 'run') {
            this.startProcess();
        } else {
            this.printHelp();
            return;
        }
    }

    printHelp() {
        console.log('Help');
        process.exit(1);
    }

    async runSetup(argv: string[]) {
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
            const host: string = args.ip;
            const api = await v3.api.createLocal(host).connect();
            const user = await api.users.createUser('artnet-hue-entertainment', 'cli');

            this.config.set('hue.host', host);
            this.config.set('hue.username', user.username);
            this.config.set('hue.clientKey', user.clientkey);

            console.log('Hue setup was successful! Credentials are saved. You can run the server now.')

        } catch (e) {
            if (e._hueError) {
                console.error(e._hueError.payload.message);
                process.exit(1);
            }
            throw e;
        }
    }

    async startProcess() {
        // TODO: Detect when setup has not yet been run
        const host = this.config.get('hue.host') as string;
        const username = this.config.get('hue.username') as string;
        const clientKey = this.config.get('hue.clientKey') as string;

        const bridge = new ArtNetHueBridge({
            hueHost: host,
            hueUsername: username,
            hueClientKey: clientKey,
            entertainmentRoomId: 6,
            artNetBindIp: '127.0.0.1',
            lights: [
                {
                    dmxStart: 1,
                    lightId: '10',
                    channelMode: '8bit-dimmable',
                },
            ]
        });
        await bridge.start();
    }
}

const handler = new ArtNetHueEntertainmentCliHandler(process.argv.slice(2));
handler.run();
