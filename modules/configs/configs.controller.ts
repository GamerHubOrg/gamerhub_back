import { Response } from "express";
import { CustomRequest } from "../../shared/types/express";

export function GetConfigs(req: CustomRequest, res: Response) {
    const { filters, sort } = req.query;

    try {
        console.log({ filters, sort });

        res.json([])
    } catch(err) {
        res.status(400).json(err);
    }
}