const Friend = require("../models/Friend.model");
const FriendRequest = require("../models/friendRequest.model");
const User = require("../models/Friend.model");
const {getUserFriendInfo} = require('./user')

exports.createFriend = async ({person1, person2}) => {
    try {
        if(person1 === person2)
            return {error: 'same user'}

        let createdFriend = new Friend(
            {
                person1,
                person2
            }
        );
        const friend = await createdFriend.save()
        await FriendRequest.deleteOne(
            {
                $or: [
                        {sender: person1, receiver: person2},
                        {sender: person2, receiver: person1}
                    ]
            }
        )

        return {msg: 'added friend', friend: friend}
    } catch(e) {
        console.log(e)
        return {error: 'error'}
    }
}

exports.deleteFriend = async ({friendId}) => {
    try {
        const friend = await Friend.findOne({_id: friendId})
        await Friend.deleteOne({_id: friendId})

        return {msg: 'deleted friend', friend: friend}
    } catch(e) {
        console.log(e)
        return {error: 'error'}
    }
}

exports.getFriends = async ({userId}) => {
    try {

        const friendsArray = await Friend.find({$or: [
            {person1: userId},
            {person2: userId}
        ]})
        const friends = []

        for(let i = 0; i < friendsArray.length; i++) {
            const prop = friendsArray[i]
            let id = prop.person1
            if(id == userId)
                id = prop.person2
            const user = await getUserFriendInfo({id})
            const friend = {friendId: prop._id, userId: user._id, fullName: user.fullName, currentStatus: user.currentStatus, lastUpdate: user.lastUpdate}
            friends.push(friend)
        }
        return friends
    } catch(e) {
        console.log(e)
        return []
    }
}

exports.areFriends = async (user1, user2) => {
    try {
        const friends = await Friend.findOne({$or: [
            {person1: user1, person2: user2},
            {person1: user2, person2: user1}
        ]})

        if(friends)
            return true
        return false
    } catch(e) {
        console.log(e)
        return false
    }
}