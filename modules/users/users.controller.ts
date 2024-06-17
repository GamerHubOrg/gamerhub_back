import { Response } from "express";
import { CustomRequest } from "../../shared/types/express";
import * as usersService from './users.service';
import crypto from 'crypto';
import { IStoredUser } from "./users.model";
import config from "../../config";
import jwt from 'jsonwebtoken'

export async function PostLogin(req: CustomRequest, res: Response) {
  const { email, password } = req.body;

  try {

    const user: IStoredUser | null = await usersService.findByEmail(email);

    if (!user) {
      res.status(400).send(new Error('Crendentials incorrect'));
      return;
    }

    const checkHash = crypto.pbkdf2Sync(password, config.security.salt, config.security.iteration, 64, 'sha512').toString('hex')

    if (user.password !== checkHash) {
      res.status(400).send(new Error('Crendentials incorrect'));
      return;
    }

    const access_token = jwt.sign({ userId: user._id }, config.security.tokenSecret, { expiresIn: '5h' });
    const refresh_token = jwt.sign({ userId: user._id }, config.security.refreshTokenSecret, { expiresIn: '48h' });

    await usersService
      .fromUserId(user._id)
      .setRefreshToken(refresh_token);

    res
      .cookie('gamerhub_refresh_token', refresh_token)
      .json({ access_token })

  } catch(err) {
    res.status(400).send(err)
  }
}

export async function PostRegister(req: CustomRequest, res: Response) {
  const { username, email, password, confirmPassword } = req.body;

  try {

    const user: IStoredUser | null = await usersService.findByEmail(email);

    if (user) {
      res.status(400).send(new Error('Email already taken'));
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).send(new Error('Passwords not matching'));
      return;
    }

    const hashedPassword = crypto.pbkdf2Sync(password, config.security.salt, config.security.iteration, 64, 'sha512').toString('hex')

    const createdUser = await usersService.create({
      username,
      email,
      password: hashedPassword
    })

    const access_token = jwt.sign({ userId: createdUser._id }, config.security.tokenSecret, { expiresIn: '5h' });
    const refresh_token = jwt.sign({ userId: createdUser._id }, config.security.refreshTokenSecret, { expiresIn: '48h' });

    console.log({ access_token, refresh_token })

    await usersService
      .fromUserId(createdUser._id)
      .setRefreshToken(refresh_token);

    res
      .cookie('gamerhub_refresh_token', refresh_token)
      .json({ access_token })

  } catch(err) {
    res.status(400).send(err)
  }
}

export async function PostLogout(req: CustomRequest, res: Response) {
  const { user } = req;

  try {

    await usersService
    .fromUserId(user!._id)
    .setRefreshToken(undefined);

    res
      .clearCookie('gamerhub_refresh_token')
      .sendStatus(200)
  } catch(err) {
    res.status(400).send(err)
  }
}

export async function GetMe(req: CustomRequest, res: Response) {
  const { user } = req

  try {
    res.json(user);
  } catch(err) {
    res.status(400).send(err)
  }
}

export async function GetUser(req: CustomRequest, res: Response) {
  const { userId } = req.params

  try {
    const user = await usersService.findById(userId).select('-password -refresh_token');

    if (!user) {
      res.status(400).send(new Error('User not found'));
      return;
    }

    res.json(user);
  } catch(err) {
    res.status(400).send(err)
  }
}