const User = require("../models/user.model");

exports.createUser = async ({firebaseUID, fullName, email, dateOfBirth}) => {
    try {
        let createdUser = new User(
            {
                firebaseUID,
                fullName,
                email,
                dateOfBirth,
                currentStatus: 'idle'
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

exports.setUserStatus = async ({id, newStatus}) => {
    try {
        const user = await User.findOne({
            _id: id
        },
        { $set: { currentStatus: newStatus }})
        return user
    } catch(e) {
        console.log(e)
        return null
    }
}

exports.setUserLocation = async ({id, newLocation}) => {
    try {
        const user = await User.findOne({
            _id: id
        },
        { $set: { lastLocation: newLocation }})
        return user
    } catch(e) {
        console.log(e)
        return null
    }
}