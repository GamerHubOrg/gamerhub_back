import { Response } from "express";
import { CustomRequest } from "../../shared/types/express";
import { getConfigs } from "./configs.service";

export async function GetConfigs(req: CustomRequest, res: Response) {
    const { filters, sort, skip = 0, limit = 20 } = req.query;

    try {
        const { list, hasMore, total } = await getConfigs({ filters, sort, skip, limit });

        res.json({ list, hasMore, total })
    } catch(err) {
        res.status(400).json(err);
    }
}