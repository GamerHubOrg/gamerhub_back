import { NextFunction, Response } from "express";
import { CustomRequest } from "../../shared/types/express";
import * as usersService from "../users/users.service";
import usersModel from "../users/users.model";
import moment from "moment";
import GameRecordModel from "../gameRecords/models/gameRecords.model";
import { getGamesThisYearQuery, getMonthsGamesData } from "./admin.functions";

export async function GetUsers(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const { limit = 30, offset = 0 } = req.query;

  try {
    const users = await usersService.getAll({
      limit: limit as number,
      offset: offset as number,
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function PatchUser(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.params;
  const { username, picture, roles, email, subscribedAt } = req.body;

  try {
    const user = await usersService.updateUserById(userId, {
      username,
      picture,
      roles,
      email,
      subscribedAt,
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function GetDashboardStats(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const usersLastMonth = await usersModel.countDocuments({
      createdAt: {
        $gte: moment().startOf("month").subtract(1, "month").toDate(),
        $lte: moment().endOf("month").subtract(1, "month").toDate(),
      },
    });

    const usersThisMonth = await usersModel.countDocuments({
      createdAt: {
        $gte: moment().startOf("month").toDate(),
        $lte: moment().endOf("month").toDate(),
      },
    });

    const usersSinceCreation = await usersModel.countDocuments();

    const monthsCategories = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    const gamesThisYear = await GameRecordModel.aggregate(getGamesThisYearQuery());
    const gamesPlayedByMonth = gamesThisYear.reduce((acc, game) => {
      return {
        ...acc,
        [game.gameName]: getMonthsGamesData(monthsCategories, game.counts),
      };
    }, {})

    res.json({ usersSinceCreation, usersLastMonth, usersThisMonth, gamesPlayedByMonth });
  } catch (err) {
    next(err);
  }
}
