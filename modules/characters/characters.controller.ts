import { NextFunction, Request, Response } from "express";
import charactersService from "./characters.service";
import cache from '../../services/redis'
import config from "../../config";

const getAllCharacters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allCharacters = await charactersService.getAllCharacters(req.query);

    cache.setEx(req.originalUrl, config.database.redisTtl, JSON.stringify(allCharacters));

    res.send(allCharacters);
  } catch (error) {
    next(error);
  }
};

const getCharacterById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const character = await charactersService.getCharacterById(id);

    cache.setEx(req.originalUrl, config.database.redisTtl, JSON.stringify(character));
    
    res.send(character);
  } catch (error) {
    next(error);
  }
};

const insertCharacter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    if (Array.isArray(body)) {
      await charactersService.insertCharacters(body);
    } else {
      await charactersService.insertCharacter(body);
    }

    cache.del('/api/users');

    res.status(201).send("The character has been created.");
  } catch (error) {
    next(error);
  }
};

const updateCharacter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const { id } = req.params;
    await charactersService.updateCharacter(id, body);

    cache.del(`/api/users/${id}`);
    cache.del('/api/users');

    res.status(201).send("The character has been updated.");
  } catch (error) {
    next(error);
  }
};

const deleteCharacters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    if (!Array.isArray(body))
      res.status(400).send("You must provide the ids to delete.");
    await charactersService.deleteCharacters(body);

    cache.del('/api/users');

    res.status(201).send("The character has been updated.");
  } catch (error) {
    next(error);
  }
};

const deleteCharacter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await charactersService.deleteCharacter(id);

    cache.del(`/api/users/${id}`);
    cache.del('/api/users');

    res.status(201).send("The character has been deleted.");
  } catch (error) {
    next(error);
  }
};

const charactersController = {
  getAllCharacters,
  getCharacterById,
  insertCharacter,
  updateCharacter,
  deleteCharacters,
  deleteCharacter,
};

export default charactersController;
