import { createClient } from 'redis';
import config from '../config';

const client = createClient({
    url: config.database.redisUrl
});

export async function connectRedis() {
    try {
        client.on("error", async (error): Promise<void> => {
            console.error(`Error : ${error}`)
            await client.disconnect();
        });

        await client.connect();
        console.log('[redis] Cache connected')
    } catch(err) {
        console.error('[redis] Unable to connect => ', err);
    }
}

export default client;