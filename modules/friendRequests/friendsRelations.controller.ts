import { NextFunction, Response } from "express";
import { CustomRequest } from "../../shared/types/express";
import * as friendsRelationsService from './friendsRelations.service';
import * as usersService from '../users/users.service';
import { IStoredUser } from "../users/users.model";

export async function FriendDemand(req: CustomRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        const user: IStoredUser | null = await usersService.findById(userId);
        const friend: IStoredUser | null = await usersService.findById(id);

        if (!user || !friend) {
        res.status(400).send('User not found');
        return;
        }

        // Check if the user already sent a friend request to the other user
        const existingFriendRequest = await friendsRelationsService.findExistingFriendRequest(user._id, friend._id);

        if (existingFriendRequest) {
        res.status(400).send('Friend request already sent');
        return;
        }

        await friendsRelationsService.createFriendRequest(user._id, friend._id);

        res.status(200).send('Friend request sent');

    } catch(err) {
        next(err)
    }
}

