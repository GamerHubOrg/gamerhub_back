import { Request, RequestHandler } from 'express';

export type User = {
  id: string,
  email: string,
  username: string,
  roles: string[],
  firstname: string,
  lastname: string,
}

export interface CustomRequest extends Request {
  user?: User
}

export interface CustomRequestHandler extends RequestHandler {}