import friendsRelationsModel from "./friendsRelations.model";
import * as usersService from '../users/users.service';

export function findExistingFriendRequest(requesterId: string, receiverId: string) {
    return friendsRelationsModel.findOne({
        $or: [
            {requester: requesterId, receiver: receiverId},
            {requester: receiverId, receiver: requesterId}
        ]
    });
}

export function createFriendRequest(requesterId: string, receiverId: string) {
    return friendsRelationsModel.create({
        requester: requesterId,
        receiver: receiverId,
        status: 'pending'
    });
}

export function blockFriend(requesterId: string, receiverId: string) {
    return friendsRelationsModel.updateOne(
        {requester: requesterId, receiver: receiverId},
        {$set: {status: 'blocked'}}
    );
}

export function refuseFriendRequest(requesterId: string, receiverId: string) {
    return friendsRelationsModel.updateOne(
        {requester: requesterId, receiver: receiverId},
        {$set: {status: 'refused'}}
    );
}

export async function acceptFriendRequest(requesterId: string, receiverId: string) {
    await friendsRelationsModel.updateOne(
        {requester: requesterId, receiver: receiverId},
        {$set: {status: 'accepted'}}
    );

    await usersService.addFriend(requesterId, receiverId);
    await usersService.addFriend(receiverId, requesterId);
}

export async function deleteFriend(requesterId: string, receiverId: string) {
    await friendsRelationsModel.deleteOne({
        $or: [
            {requester: requesterId, receiver: receiverId},
            {requester: receiverId, receiver: requesterId}
        ]
    });

    await usersService.removeFriend(requesterId, receiverId);
    await usersService.removeFriend(receiverId, requesterId);
}
