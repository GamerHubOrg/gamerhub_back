import { Request, RequestHandler } from 'express';
import { IStoredUser } from '../../modules/users/users.model';

export interface User {
  _id: string,
  email: string,
  username: string,
  roles: string[],
}

export interface CustomRequest extends Request {
  user?: IStoredUser
}

export interface CustomRequestHandler extends RequestHandler {}