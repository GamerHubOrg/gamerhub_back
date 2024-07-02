import { NextFunction, Response } from "express";
import { CustomRequest } from "../../shared/types/express";
import * as usersService from './users.service';
import crypto from 'crypto';
import { IStoredUser } from "./users.model";
import config from "../../config";
import jwt from 'jsonwebtoken'
import stripe from "../../services/stripe";
import cache from '../../services/redis';

export async function PostLogin(req: CustomRequest, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  try {

    const user: IStoredUser | null = await usersService.findByEmail(email);

    if (!user) {
      res.status(400).send('Credentials incorrect');
      return;
    }

    const checkHash = crypto.pbkdf2Sync(password, config.security.salt, config.security.iteration, 64, 'sha512').toString('hex')

    if (user.password !== checkHash) {
      res.status(400).send('Credentials incorrect');
      return;
    }

    const access_token = jwt.sign({ userId: user._id }, config.security.tokenSecret, { expiresIn: '5h' });
    const refresh_token = jwt.sign({ userId: user._id }, config.security.refreshTokenSecret, { expiresIn: '48h' });

    await usersService
      .fromUserId(user._id)
      .setRefreshToken(refresh_token);

    res
      .cookie('gamerhub_refresh_token', refresh_token, { httpOnly: true, secure: config.env === 'production' })
      .cookie('gamerhub_access_token', access_token, { httpOnly: true, secure: config.env === 'production' })
      .json({ access_token })

  } catch(err) {
    next(err)
  }
}

export async function PostRegister(req: CustomRequest, res: Response, next: NextFunction) {
  const { username, email, password, confirmPassword } = req.body;

  try {

    const user: IStoredUser | null = await usersService.findByEmail(email);

    if (user) {
      res.status(400).send('Email already taken');
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).send('Passwords not matching');
      return;
    }

    const hashedPassword = crypto.pbkdf2Sync(password, config.security.salt, config.security.iteration, 64, 'sha512').toString('hex')

    const stripeCustomer = await stripe.customers.create({
      email: email,
      name: username,
    });

    const createdUser = await usersService.create({
      username,
      email,
      password: hashedPassword,
      stripe: { customerId: stripeCustomer.id },
    })

    const access_token = jwt.sign({ userId: createdUser._id }, config.security.tokenSecret, { expiresIn: '5h' });
    const refresh_token = jwt.sign({ userId: createdUser._id }, config.security.refreshTokenSecret, { expiresIn: '48h' });

    await usersService
      .fromUserId(createdUser._id)
      .setRefreshToken(refresh_token);

    res
      .cookie('gamerhub_refresh_token', refresh_token, { httpOnly: true, secure: config.env === 'production' })
      .cookie('gamerhub_access_token', access_token, { httpOnly: true, secure: config.env === 'production' })
      .json({ access_token })

  } catch(err) {
    next(err)
  }
}

export async function PostLogout(req: CustomRequest, res: Response, next: NextFunction) {
  const { user } = req;

  try {

    await usersService
    .fromUserId(user!._id)
    .setRefreshToken(undefined);

    res
      .clearCookie('gamerhub_refresh_token')
      .clearCookie('gamerhub_access_token')
      .sendStatus(200)
  } catch(err) {
    next(err)
  }
}

export async function GetMe(req: CustomRequest, res: Response, next: NextFunction) {
  const { user } = req

  try {

    if (user?.stripe?.customerId) {
      res.json(user);
      return;
    }

    const stripeCustomer = await stripe.customers.create({
      email: user!.email,
      name: user?.username,
    });

    const updatedUser = await usersService
      .fromUserId(user!._id)
      .setCustomerId({ customerId: stripeCustomer.id }).select('-password -refresh_token');

    res.json(updatedUser);
  } catch(err) {
    next(err)
  }
}

export async function GetUser(req: CustomRequest, res: Response, next: NextFunction) {
  const { userId } = req.params

  try {
    const user = await usersService.findById(userId).select('-password -refresh_token');

    if (!user) {
      res.status(400).send('User not found');
      return;
    }

    cache.setEx(req.originalUrl, config.database.redisTtl, JSON.stringify(user));

    res.json(user);
  } catch(err) {
    next(err)
  }
}

export async function GetRefreshAccessToken(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.gamerhub_refresh_token;

    if (!token) return res.status(401).send('No token')

    const result = jwt.verify(token, config.security.refreshTokenSecret) as any;

    const user = await usersService.findById(result.userId);

    if (!user) {
      res.status(400).send('User not found');
      return;
    }

    if(!user.refresh_token || (user.refresh_token !== token)){
      return res.status(400).send("Refresh Token is invalid")
    }

    try {
      jwt.verify(user.refresh_token, config.security.refreshTokenSecret);
    } catch(e) {
      return res.status(401).send("Refresh Token is invalid")
    }

    const access_token = jwt.sign({ userId: user._id }, config.security.tokenSecret, { expiresIn: '5h' });

    res
      .cookie('gamerhub_access_token', access_token, { httpOnly: true, secure: config.env === 'production' })
      .sendStatus(201)
  } catch(err) {
    next(err)
  }
}

export async function UpdateUserById(req: CustomRequest, res: Response) {
  const {userId} = req.params
  const {body} = req
  try {
      const updatedUser = await usersService.updateUserById(userId, body)
      return res.json(updatedUser)
  } catch (error) {
      return res.status(500).json(error)
  }
}

export async function UpdateUserPassword(req: CustomRequest, res: Response) {
  const {userId} = req.params
  const {oldPassword, newPassword, newPasswordConfirm } = req.body

  const user: IStoredUser | null = await usersService.findById(userId);

  if (!user) {
    res.status(400).send('Credentials incorrect');
    return;
  }

  if (newPassword !== newPasswordConfirm) {
    res.status(400).send('Different password');
    return;
  }

  const checkHash = crypto.pbkdf2Sync(oldPassword, config.security.salt, config.security.iteration, 64, 'sha512').toString('hex');

  if (user.password !== checkHash) {
    res.status(400).send('Credentials incorrect');
    return;
  }

  const hashedPassword = crypto.pbkdf2Sync(newPassword, config.security.salt, config.security.iteration, 64, 'sha512').toString('hex')

  try {
      const updatedUserPassword = await usersService.updateUserPasswordById(userId, hashedPassword)
      return res.json(updatedUserPassword)
  } catch (error) {
      return res.status(500).json(error)
  }
}



