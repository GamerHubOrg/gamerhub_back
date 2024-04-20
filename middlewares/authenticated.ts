import { Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { KeycloakToken } from 'shared/types/keycloak';
import { CustomRequest } from 'shared/types/express';
import { verifyKeycloakSession } from '../services/keycloak';

const handler: RequestHandler = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).send();
    }

    const isTokenSessionValid = await verifyKeycloakSession(token);

    if (!isTokenSessionValid) {
      return res.status(401).send();
    }

    const decoded = jwt.decode(token) as KeycloakToken;

    req.user = {
      email: decoded.email,
      firstname: decoded.given_name,
      lastname: decoded.family_name,
      username: decoded.preferred_username,
      roles: decoded.realm_access.roles,
    };

    next();
  } catch(err) {
    return res.status(401).send();
  }
};

export default handler;