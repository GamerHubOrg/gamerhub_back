import { Response } from "express";
import { CustomRequest } from "../../shared/types/express";
import * as usersService from './users.service';

export async function GetUser(req: CustomRequest, res: Response) {
  const { userId } = req.params;

  try {
    const user = await usersService.findById(userId);

    res.json(user);
  } catch(err) {
    res.status(400).json(err)
  }
}