import { v3 } from 'node-hue-api';
import { HueDtlsController } from './hue-dtls';
import { ArtNetController } from './artnet/controller';
import { ArtDmx } from './artnet/protocol';


export async function start(host: string, username: string, clientKey: string) {
    console.log('Connecting to Hue bridge...');
    const api = await v3.api.createLocal(host).connect(username);
    const entertainment = await api.groups.getEntertainment();

    const dtlsController = new HueDtlsController(host, username, clientKey);
    dtlsController.on('close', () => {
        process.exit(0);
    });

    console.log('Requesting streaming mode...');
    const streamingResponse = await api.groups.enableStreaming(entertainment[0].id);
    console.log('Streaming enabled:', streamingResponse);

    console.log('Sleeping for 3s to give the Hue bridge time to enable streaming mode');

    // Short delay because it can take some time for the Hue bridge to start
    // listening on the DTLS port.
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('Performing streaming mode handshake...');
    await dtlsController.connect();

    console.log('Starting ArtNet listener...');

    let running = true;

    // TODO: Multiple control modes:
    //   - RGB 8bit (Upscale to 16bit)
    //   - RGB 8bit + dimmer (We use the dimmer for a full 16bit value)
    //   - RGB 16bit (Full control)
    // TODO: Keepalive to Hue when no Artnet is received
    // TODO: Shutdown handler

    const artNetListener = new ArtNetController();
    artNetListener.bind('127.0.0.1');
    artNetListener.on('dmx', (data: ArtDmx) => {
        if (!running) {
            return;
        }

        dtlsController.sendUpdate([
            {lightId: 10, color: [data.data[0], data.data[1], data.data[2], data.data[3], data.data[4], data.data[5]]},
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
}
