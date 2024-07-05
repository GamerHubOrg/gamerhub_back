import { NextFunction, Request, Response } from "express";
import gameRecordsService from "./gameRecords.service";
// import cache from '../../services/redis'
// import config from "../../config";

const getAllGameRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { offset, limit, ...filters } = req.query;
    const intOffset =
      offset && typeof offset === "string" ? parseInt(offset) : undefined;
    const intLimit =
      limit && typeof limit === "string" ? parseInt(limit) : undefined;

    const totalRecords = await gameRecordsService.countGameRecords(filters);
    const records = await gameRecordsService.getAllGameRecords(
      filters,
      intOffset,
      intLimit
    );

    // cache.setEx(req.originalUrl, config.database.redisTtl, JSON.stringify(allGameRecords));

    res.send({ records, totalRecords });
  } catch (error) {
    next(error);
  }
};

const getAllGameRecordsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { offset, limit, ...filters } = req.query;
    const intOffset =
      offset && typeof offset === "string" ? parseInt(offset) : undefined;
    const intLimit =
      limit && typeof limit === "string" ? parseInt(limit) : undefined;

    const totalRecords = await gameRecordsService.countGameRecords({
      ...filters,
      users: userId,
    });
    const records = await gameRecordsService.getAllGameRecords(
      {
        ...filters,
        users: userId,
      },
      intOffset,
      intLimit
    );

    // cache.setEx(req.originalUrl, config.database.redisTtl, JSON.stringify(allGameRecords));

    res.send({ records, totalRecords });
  } catch (error) {
    next(error);
  }
};

const getGameRecordById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const gameRecord = await gameRecordsService.getGameRecordById(id);

    // cache.setEx(req.originalUrl, config.database.redisTtl, JSON.stringify(gameRecord));

    res.send(gameRecord);
  } catch (error) {
    next(error);
  }
};

const insertGameRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    if (Array.isArray(body)) {
      await gameRecordsService.insertGameRecords(body);
    } else {
      await gameRecordsService.insertGameRecord(body);
    }

    // cache.del('/api/users');

    res.status(201).send("The gameRecord has been created.");
  } catch (error) {
    next(error);
  }
};

const updateGameRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    await gameRecordsService.updateGameRecord(id, body);

    // cache.del(`/api/users/${id}`);
    // cache.del('/api/users');

    res.status(201).send("The gameRecord has been updated.");
  } catch (error) {
    next(error);
  }
};

const deleteGameRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    if (!Array.isArray(body))
      res.status(400).send("You must provide the ids to delete.");
    await gameRecordsService.deleteGameRecords(body);

    // cache.del('/api/users');

    res.status(201).send("The gameRecord has been updated.");
  } catch (error) {
    next(error);
  }
};

const deleteGameRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await gameRecordsService.deleteGameRecord(id);

    // cache.del(`/api/users/${id}`);
    // cache.del('/api/users');

    res.status(201).send("The gameRecord has been deleted.");
  } catch (error) {
    next(error);
  }
};

const gameRecordsController = {
  getAllGameRecords,
  getAllGameRecordsByUser,
  getGameRecordById,
  insertGameRecord,
  updateGameRecord,
  deleteGameRecords,
  deleteGameRecord,
};

export default gameRecordsController;
