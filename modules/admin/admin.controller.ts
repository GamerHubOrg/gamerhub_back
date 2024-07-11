import { NextFunction, Response } from "express";
import { CustomRequest } from "../../shared/types/express";
import * as usersService from "../users/users.service";
import * as banishmentsService from "./banishments.service";
import usersModel, { IStoredUser } from "../users/users.model";
import moment from "moment";
import GameRecordModel from "../gameRecords/models/gameRecords.model";
import { getGamesThisYearQuery, getMonthsGamesData } from "./admin.functions";
import stripe from "../../services/stripe";
import { banishmentsModel } from "./admin.model";

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

export async function GetBanishments(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const { limit = 30, offset = 0 } = req.query;

  try {
    const banishments = await banishmentsService.getAll({
      limit: limit as number,
      offset: offset as number,
    });

    res.json(banishments);
  } catch (err) {
    next(err);
  }
}

export async function DeleteBanishment(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const { banishmentId} = req.params;

  try {
    const banishment = await banishmentsService.fromBanishmentId(banishmentId).getOne();

    if (!banishment) {
      res.status(400).send('Banishment do not exist');
      return;
    }

    await banishmentsService.fromBanishmentId(banishmentId).delete();
    
    const user = await usersService.findByEmail(banishment.email);

    if (user) {
      await usersService.fromUserId(user._id).setBanned(false);
    }

    res.sendStatus(200);
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

export async function BanUser(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.params;
  const { message, type } = req.body;

  try {
    const user = await usersService.findById(userId) as IStoredUser;

    if (!user) {
      res.status(400).send('User do not exist');
      return;
    }

    if (user.bannedAt) {
      res.status(400).send('User already banned');
      return;
    }

    if (user.stripe.subscriptionId) {
      await stripe.subscriptions.cancel(user.stripe.subscriptionId);
    }

    await usersService
      .fromUserId(userId)
      .setBanned(true);

    await banishmentsModel.create({
      email: user.email,
      ip: type === 'ip' ? user.address : undefined,
      message,
      type,
    })

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}
