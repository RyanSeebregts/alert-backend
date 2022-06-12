const User = require("../models/user.model");

exports.createUser = async ({firebaseUID, fullName, email, dateOfBirth}) => {
    try {
        let createdUser = new User(
            {
                firebaseUID,
                fullName,
                email,
                dateOfBirth,
                currentStatus: 'idle',
                disableAlertSend: false
            }
        );

        const user = await createdUser.save()
        console.log(user)
        return user
    } catch(e) {
        console.log(e)
    }
}

exports.getUserAuth = async ({id}) => {
    try {

        const user = await User.findOne({
            _id: id
        })
        .lean()
        .select("_id fullName currentStatus email lastLocation")
        console.log(user)
        return user
    } catch(e) {
        console.log(e)
        return null
    }
}

exports.getUserStatus = async ({id}) => {
    try {

        const user = await User.findOne({
            _id: id
        })
        .lean()
        .select("currentStatus disableAlertSend")
        return user
    } catch(e) {
        console.log(e)
        return null
    }
}

exports.setUserStatus = async ({id, newStatus}) => {
    try {
        const user = await User.updateOne({
            _id: id
        },
        { $set: { currentStatus: newStatus }})
        return user
    } catch(e) {
        console.log(e)
        return null
    }
}

exports.setDisableAlertSend = async ({id, newDisableAlert}) => {
    try {
        const user = await User.updateOne({
            _id: id
        },
        { $set: { disableAlertSend: newDisableAlert }})
        return user
    } catch(e) {
        console.log(e)
        return null
    }
}

exports.setUserLocation = async ({id, newLocation}) => {
    try {
        const user = await User.updateOne({
            _id: id
        },
        { $set: { lastLocation: newLocation, lastUpdate: new Date() }})
        return user
    } catch(e) {
        console.log(e)
        return null
    }
}

exports.searchUsers = async ({search}) => {
    try {
        const users = await User.find({
            $or: [
                {email: {$regex: search} },
                {fullName: {$regex: search} }
            ]
        })
        .lean()
        .select("_id fullName currentStatus")
        return users
    } catch(e) {
        console.log(e)
        return null
    }
}

exports.getUserFriendInfo = async ({id}) => {
    try {

        const user = await User.findOne({
            _id: id
        })
        .lean()
        .select("_id fullName currentStatus lastUpdate")
        return user
    } catch(e) {
        console.log(e)
        return null
    }
}


exports.getUserFriendDetailedInfo = async ({id}) => {
    try {

        const user = await User.findOne({
            _id: id
        })
        .lean()
        .select("_id fullName currentStatus lastUpdate lastLocation")
        if(user.currentStatus !== 'idle')
            return user
        else 
            throw "user not alerted"
    } catch(e) {
        console.log(e)
        return null
    }
}