import { Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../shared/types/express";
import config from "../config";
import * as usersService from '../modules/users/users.service';
import { IStoredUser } from "../modules/users/users.model";
import { banishmentsModel } from "../modules/admin/admin.model";

export const verifyAuth = async (token?: string) => {
  if (!token) {
    throw new Error("No token provided")
  }

  const decoded = jwt.verify(token, config.security.tokenSecret) as any;

  const user = await usersService.findById(decoded.userId).select('-password -refresh_token -address');

  return user;
};

const handler: RequestHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.gamerhub_access_token;

  try {
    if (!token) {
      return res.status(401).send("Vous n'êtes pas connecté.");
    }

    const decoded = jwt.verify(token, config.security.tokenSecret) as any;

    const user = await usersService.findById(decoded.userId).select('-password -refresh_token');

    if (!user) {
      return res.status(401).send();
    }

    const userBanishment = await banishmentsModel.findOne({ $or: [{ email: user.email }, { ip: user.address }] });

    if (userBanishment) {
      return res.status(401).send("Votre compte est définitivement bannis.");
    }

    const ip = req.headers['x-forwarded-for'] as string;

    if (user.address !== ip) {
      await usersService.fromUserId(user._id).setIpAddress(ip);
    }

    delete user.address;
    req.user = user as IStoredUser;
  
    next();
  } catch(err: any) {
    if (err.message == 'jwt expired') {
      res.sendStatus(403);
      return;
    }
    res.status(401).send(err.message);
  }
};

export default handler;
