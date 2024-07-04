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
    const allGameRecords = await gameRecordsService.getAllGameRecords(
      req.query
    );

    // cache.setEx(req.originalUrl, config.database.redisTtl, JSON.stringify(allGameRecords));

    res.send(allGameRecords);
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
    const allGameRecords = await gameRecordsService.getAllGameRecords({
      users: userId,
    });

    // cache.setEx(req.originalUrl, config.database.redisTtl, JSON.stringify(allGameRecords));

    res.send(allGameRecords);
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
