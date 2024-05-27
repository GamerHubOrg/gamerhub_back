import { Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { KeycloakToken } from "../shared/types/keycloak";
import { CustomRequest, User } from "../shared/types/express";
import { verifyKeycloakSession } from "../services/keycloak";


// const handler: RequestHandler = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.header("Authorization");

//   if (!token) {
//     return res.status(401).send();
//   }

//   const isTokenSessionValid = await verifyKeycloakSession(token);

//   if (!isTokenSessionValid) {
//     return res.status(401).send();
//   }

//   const decoded = jwt.decode(token) as KeycloakToken;

//   req.user = {
//     email: decoded.email,
//     firstname: decoded.given_name,
//     lastname: decoded.family_name,
//     username: decoded.preferred_username,
//     roles: decoded.realm_access.roles,
//   };

//   next();
// };

export const verifyAuth = (token?: string) => {
  return new Promise<User>((resolve, reject) => {
    try {
      if (!token) {
        return reject("No token provided");
      }

      verifyKeycloakSession(token).then((isTokenSessionValid) => {
        if (!isTokenSessionValid) {
          return reject("Token session invalid");
        }

        const decoded = jwt.decode(token) as KeycloakToken;

        const user = {
          email: decoded.email,
          firstname: decoded.given_name,
          lastname: decoded.family_name,
          username: decoded.preferred_username,
          roles: decoded.realm_access.roles,
        };

        resolve(user);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const handler: RequestHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");

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
};

export default handler;
