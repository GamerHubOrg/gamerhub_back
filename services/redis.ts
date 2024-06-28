import { createClient, RedisClientOptions } from 'redis';
import config from '../config';
import { getLogger } from '../shared/tools/logger';

const client = createClient({
    url: config.database.redisUrl
});
const logger = getLogger();

export async function connectRedis() {
    try {
        client.on("error", (error) => console.error(`Error : ${error}`));

        await client.connect();
        logger.info('[redis]: Connected successfully')
    } catch(err) {
        logger.error('[redis]: Unable to connect => ', err);
    }
}

export default client;