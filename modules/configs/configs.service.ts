import { PipelineStage } from "mongoose";
import { convertObjectValuesToNumbers, convertObjectValuesToMongooseQuery } from "../../utils/functions";
import configsModel from "./configs.model";

interface IGetConfigs {
    filters: any,
    sort: any,
    skip: any,
    limit: any,
}

export async function getConfigs({ filters, sort, skip, limit }: IGetConfigs) {
    const $sort = { $sort: { ...convertObjectValuesToNumbers(sort) } };
    const $match = filters ? { $match: { ...convertObjectValuesToMongooseQuery(filters) } } : undefined;
    const $skip = { $skip: Number(skip) };
    const $limit = { $limit: Number(limit) };

    const query = [
        $match,
        $sort,
    ].filter((q) => !!q);

    const configs = await configsModel.aggregate([
        ...(query as PipelineStage[]),
        $skip,
        $limit,
    ]);
    
    const aggregateCount = await configsModel.aggregate([
        ...(query as PipelineStage[]),
        { $count: 'nbTotalConfigs' },
    ]);
    
    const nbTotalConfigs = aggregateCount[0]?.nbTotalConfigs || 0;
    const nbConfigsLeft = nbTotalConfigs - configs.length;
    
    return {
        list: configs,
        hasMore: nbConfigsLeft > 0,
        total: nbTotalConfigs,
    };
}

interface ICreateConfig {
    game: string;
    name: string;
    config: any;
    userId?: string;
}

export function create({ game, name, config, userId }: ICreateConfig) {
    return configsModel.create({
        game,
        name,
        options: config,
        userId
    })
}