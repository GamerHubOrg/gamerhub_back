import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../shared/types/express";

const handler: RequestHandler = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { user } = req;

  try {
    if (!user) {
      return res.status(401).send();
    }

    if (!user.roles.includes('admin')) {
      return res.status(401).send();
    }
   
    next();
  } catch(err: any) {
    res.sendStatus(401);
  }
};

export default handler;