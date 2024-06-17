import axios from 'axios';
import https from 'node:https';

const agent = new https.Agent({  
  rejectUnauthorized: false,
  requestCert: false,
});

const instance = axios.create({
  baseURL: `${process.env.KEYCLOAK_BASE_URL}/realms`,
  httpsAgent: agent,
  headers: {
    Authorization: `Basic ${process.env.KEYCLOAK_CLIENT_AUTH}`,
    Accept: '*/*',
    Host: process.env.KEYCLOAK_HOST,
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

export async function verifyKeycloakSession(token: string): Promise<boolean> {
  try {
    const { data } = await instance.post('/gamerhub/protocol/openid-connect/token/introspect', { token });

    const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
    const isTokenExpired = data.exp < currentTimestampInSeconds;
    const isTokenSessionActive = data.active;

    return !isTokenExpired && isTokenSessionActive;
  } catch(err) {
    return false;
  }
}

export async function getKeycloakUser(userId: string) { 
  const { data } = await instance.post('/master/protocol/openid-connect/token', {
    grant_type: 'client_credentials',
    client_id: 'keycloak_admin_rest_api',
    client_secret: process.env.KEYCLOAK_REST_API_AUTH
  });


  const token = data.access_token;

  const apiInstance = axios.create({
    baseURL: `${process.env.KEYCLOAK_BASE_URL}/admin/realms/gamerhub`,
    httpsAgent: agent,
    headers: {
      Authorization: `Basic ${process.env.KEYCLOAK_CLIENT_AUTH}`,
      Accept: 'application/json',
      Host: process.env.KEYCLOAK_HOST,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const { data: user } = await apiInstance.get(`users/${userId}`, { headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  } })

  return user;
}