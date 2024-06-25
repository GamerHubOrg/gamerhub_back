import { NextFunction, Request, Response } from "express";
import charactersService from "./characters.service";

const getAllCharacters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allCharacters = await charactersService.getAllCharacters(req.query);   
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
