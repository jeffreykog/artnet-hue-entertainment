import axios, {AxiosInstance} from "axios";
import * as https from "https";
import {EntertainmentConfigurationGet} from "./types";


export class ClipApi {

    private readonly host: string;
    private readonly username: string;

    private readonly client: AxiosInstance;

    constructor(host: string, username: string) {
        this.host = host;
        this.username = username;

        this.client = axios.create({
            baseURL: 'https://' + host,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            headers: {
                'hue-application-key': this.username,
            }
        });
    }

    async getEntertainmentConfigurations(): Promise<EntertainmentConfigurationGet[]> {
        const response = await this.client.get('/clip/v2/resource/entertainment_configuration');
        return response.data.data;
    }

    async createEntertainmentConfiguration() {
        const r = await this.client.get('/clip/v2/resource/entertainment');
        console.log(r.data.data);

        const response = await this.client.post('/clip/v2/resource/entertainment_configuration', {
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
                        position: {x: 0, y: 0, z: 0},
                        positions: [
                            {x: 0, y: 0, z: 0},
                        ]
                    }
                ]
            }
        });

        console.log(response.status);
        console.log(response.data);
    }
}
