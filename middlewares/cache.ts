import { NextFunction, Request, Response } from 'express';
import cache from '../services/redis';

const handler = async (req: Request, res: Response, next: NextFunction) => {
  const path = req.originalUrl;

  try {
    const fromCache = await cache.get(path);

    if (!fromCache) {
        return next();
    }
    
    res.json(JSON.parse(fromCache));
  } catch (err: any) {
    return res.status(500).json({ message: "An error occured", err: err.message });
  }
}

export default handler;