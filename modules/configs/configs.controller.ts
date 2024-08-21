import { NextFunction, Response } from "express";
import { CustomRequest } from "../../shared/types/express";
import * as configsService from "./configs.service";
import cache from '../../services/redis';
import config from "../../config";

export async function GetConfigs(req: CustomRequest, res: Response, next: NextFunction) {
    const { filters, sort, offset = 0, limit = 20 } = req.query;

    try {
        const { list, total } = await configsService.getConfigs({ filters, sort, offset, limit });

        cache.setEx(req.originalUrl, config.database.redisTtl, JSON.stringify({ list, total }));

        res.json({ list, total })
    } catch(err) {
        next(err);
    }
}

export async function PostConfig(req: CustomRequest, res: Response, next: NextFunction) {
    const { name, game, config } = req.body;
    const user = req.user;

    try {
        const newConfig = await configsService.create({ name, game, config, userId: user?._id });

        cache.del('/api/configs');
        cache.del('/api/configs?*');

        res.json(newConfig)
    } catch(err) {
        next(err);
    }
}