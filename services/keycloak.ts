import axios from 'axios';
import https from 'node:https';

const agent = new https.Agent({  
  rejectUnauthorized: false,
  requestCert: false,
});

const instance = axios.create({
  baseURL: `${process.env.KEYCLOAK_BASE_URL}/realms/gamerhub/protocol/openid-connect`,
  httpsAgent: agent,
  headers: {
    Authorization: `Basic ${process.env.KEYCLOAK_CLIENT_AUTH}`,
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});


export async function verifyKeycloakSession(token: string): Promise<boolean> {
  try {
    const { data } = await instance.post('/token/introspect', { token });

    const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
    const isTokenExpired = data.exp < currentTimestampInSeconds;
    const isTokenSessionActive = data.active;

    return !isTokenExpired && isTokenSessionActive;
  } catch(err) {
    return false;
  }
}