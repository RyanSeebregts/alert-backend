const FriendRequest = require("../models/friendRequest.model");
const User = require("../models/user.model");

const {createFriend} = require("./friend");

exports.sendRequest = async ({senderId, receiverId}) => {
    try {
        if(senderId === receiverId)
            return {error: 'same user'}

        const requestSent = await FriendRequest.findOne({sender: senderId, receiver: receiverId})
        if(requestSent !== null) {
            return {error: 'request already sent'}
        }
        const requestReceived = await FriendRequest.findOne({sender: receiverId, receiver: senderId})
        if(requestReceived !== null) {
            let newFriend = await createFriend({person1: senderId, person2: receiverId})
            return newFriend
        }

        let createdRequest = new FriendRequest(
            {
                sender: senderId,
                receiver: receiverId
            }
        );

        const request = await createdRequest.save()
        console.log(request)
        return {msg: 'request sent', request}
    } catch(e) {
        console.log(e)
        return {error: 'error'}
    }
}

exports.acceptRequest = async ({requestId}) => {
    try {
        const request = await FriendRequest.findOne({_id: requestId})
        console.log('accepting request')
        console.log(requestId)
        console.log(request)
        if(!request) {
            return {error: 'error'}
        }
        const createFriendResponse = await createFriend({person1: request.sender, person2: request.receiver})
        return {msg: 'deleted friend', request}

    } catch(e) {
        console.log(e)
        return {error: 'error'}
    }
}

exports.deleteRequest = async ({requestId}) => {
    try {
        const request = FriendRequest.findOne({_id: requestId})
        if(!request) {
            return {error: 'error'}
        }
        await FriendRequest.deleteOne({_id: requestId})
        return {msg: 'deleted friend', request}
    } catch(e) {
        console.log(e)
        return {error: 'error'}
    }
}

exports.getFriendRequestsSent = async ({userId}) => {
    try {
        const friendRequests = await FriendRequest.find({sender: userId})
        const requests = []
        for(let i = 0; i < friendRequests.length; i++) {
            const prop = friendRequests[i]
            const user = await User.findOne({_id: prop.receiver}).select("_id fullName").lean()
            const friend = {requestId: prop._id, userId: user._id, fullName: user.fullName}
            requests.push(friend)
        }
        return requests
    } catch(e) {
        console.log(e)
        return []
    }
}

exports.getFriendRequestsReceived = async ({userId}) => {
    try {
        const friendRequests = await FriendRequest.find({receiver: userId})
        const requests = []
        for(let i = 0; i < friendRequests.length; i++) {
            const prop = friendRequests[i]
            const user = await User.findOne({_id: prop.sender}).select("_id fullName").lean()
            const friend = {requestId: prop._id, userId: user._id, fullName: user.fullName}
            requests.push(friend)
        }
        return requests
    } catch(e) {
        console.log(e)
        return []
    }
}