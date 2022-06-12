const User = require("../models/user.model");
const firebaseAdmin = require('firebase-admin');
const { createUser, getUserAuth, setUserStatus, searchUsers, getUserStatus, setDisableAlertSend, setUserLocation, getUserFriendDetailedInfo } = require('../databaseFunctions/user')
const {getFriends, createFriend, deleteFriend, areFriends } = require('../databaseFunctions/friend')
const { findDeviceUser } = require('../databaseFunctions/device')
const {getFriendRequestsSent, getFriendRequestsReceived, sendRequest, deleteRequest, acceptRequest } = require('../databaseFunctions/friendRequest')
const { sendMessage } = require('../socket')
exports.authorise = async (req, res) => {
  try {
    const user = req.user
    const userInfo = await getUserAuth({id: user})
    if(userInfo) {
      return res.status(200).json({ user: userInfo });
    }
    else {
      return res.status(404).json({ error: "user not found" });
    }
  } catch(e) {
    console.log(e)
    return res.status(500).json({ error: "internal server error" });
  }
}

exports.signUp = async(req, res) => {
  try { 
    const {
      email, 
      fullName,
      password,
      dateOfBirth
    } = req.body

    try {
      const firebaseResponse = await firebaseAdmin.auth().createUser({
        email: email,
        password: password,
        displayName: fullName,
      })

      try {
        const databaseResponse = await createUser({
          firebaseUID: firebaseResponse.uid,
          fullName,
          email,
          dateOfBirth,
        })
        return res.status(200).json({ success: true});
  
      } catch(databaseError) {
        console.log(databaseError)
        return res.status(500).json({ error: "internal server error" });
      }

    } catch(firebaseError) {
      console.log(firebaseError.errorInfo.code)
      return res.status(400).json({ error: firebaseError.errorInfo.code })
    }

  } catch(e) {
    console.log(e)
    return res.status(500).json({ error: "internal server error" });
  }
}


exports.userStatusController = async(req, res) => {
  try { 
    const {
      status, 
    } = req.body
    
    const user = req.user

    setUserStatus(user, status)

  } catch(e) {
    console.log(e)
    return res.status(500).json({ error: "internal server error" });
  }
}

exports.findFriends = async(req, res) => {
  try { 
    const {
      search 
    } = req.query
    
    const user = req.user

    const foundUsers = await searchUsers({search})
    res.status(200).json({ users: foundUsers });
  } catch(e) {
    console.log(e)
    return res.status(500).json({ error: "internal server error" });
  }
}

exports.sendFriendRequest = async(req, res) => {
  try { 
    const {
      friendId 
    } = req.body
    
    const user = req.user

    const sendRequestResponse = await sendRequest({senderId: user, receiverId: friendId})
    if(!sendRequestResponse.error) {

      sendMessage({userId: user, message: 'refresh user info', data: null})
      if(sendRequestResponse.request) {
        let id = sendRequestResponse.request.receiver
        if(id === user)
          id =  sendRequestResponse.request.sender

        sendMessage({userId: id, message: 'refresh user info', data: null})
      }

      res.status(200).json({ sent: 'friend request sent' });
    }
    else {
      throw 'error'
    }
  } catch(e) {
    console.log(e)
    return res.status(500).json({ error: "internal server error" });
  }
}

exports.deleteFriendRequest = async(req, res) => {
  try { 
    const {
      requestId 
    } = req.body
    const user = req.user

    const deleteRequestResponse = await deleteRequest({requestId})
    if(!deleteRequestResponse.error) {

      sendMessage({userId: user, message: 'refresh user info', data: null})
      if(deleteRequestResponse.request) {
        let id = deleteRequestResponse.request.receiver
        if(id === user)
          id =  deleteRequestResponse.request.sender

        sendMessage({userId: id, message: 'refresh user info', data: null})
      }

      res.status(200).json({ sent: 'friend request deleted' });
    }
    else {
      console.log('friend request does not exist')
      throw 'error'
    }
  } catch(e) {
    console.log(e)
    return res.status(500).json({ error: "internal server error" });
  }
}

exports.getUserInfo = async(req, res) => {
  try { 
    const user = req.user
    const userInfo = await getUserAuth({id: user})
    const friends = await getFriends({userId: user})
    const sentRequests = await getFriendRequestsSent({userId: user})
    const receivedRequests = await getFriendRequestsReceived({userId: user})
    res.status(200).json({ friends, sentRequests, receivedRequests, userInfo });
  } catch(e) {
    console.log(e)
    return res.status(500).json({ error: "internal server error" });
  }
}

exports.acceptFriendRequest = async(req, res) => {
  try { 
    const {
      requestId 
    } = req.body
    
    const user = req.user

    const acceptFriendResponse = await acceptRequest({requestId})
    if(!acceptFriendResponse.error) {

      sendMessage({userId: user, message: 'refresh user info', data: null})
      if(acceptFriendResponse.request) {
        let id = acceptFriendResponse.request.receiver
        if(id === user)
          id =  acceptFriendResponse.request.sender

        sendMessage({userId: id, message: 'refresh user info', data: null})
      }

      return res.status(200).json({ sent: 'friend added' });
    }
    else {
      throw 'error'
    }
  } catch(e) {
    console.log(e)
    return res.status(500).json({ error: "internal server error" });
  }
}

exports.deleteFriend = async(req, res) => {
  try { 
    const {
      friendId 
    } = req.body
    
    const user = req.user

    const deleteFriendResponse = await deleteFriend({friendId})
    if(!deleteFriendResponse.error) {

      sendMessage({userId: user, message: 'refresh user info', data: null})
      if(deleteFriendResponse.friend) {
        let id = deleteFriendResponse.friend.person1
        if(id === user)
          id =  deleteFriendResponse.friend.person2

        sendMessage({userId: id, message: 'refresh user info', data: null})
      }

      return res.status(200).json({ sent: 'friend deleted' });
    }
    else {
      throw 'error'
    }
  } catch(e) {
    console.log(e)

    return res.status(500).json({ error: "internal server error" });
  }
}

exports.sendAlert = async(req, res) => {
  try { 
    const {
      lat,
      lng,
      deviceId
    } = req.query
    
    const userId = await findDeviceUser({deviceId})
    if(userId && !userId.error) {
      const userFriends =  await getFriends({userId})

      const userStatus = await getUserStatus({id: userId})
      if(userStatus) {
        if(userStatus.disableAlertSend) {
          const userDisabelAlertSuccess = await setDisableAlertSend({id: userId, newDisableAlert: false})
          return res.status(304).json({ error: 'alert disabled' });
        }
        else {
          const userStatusSuccess = await setUserStatus({id: userId, newStatus: 'alert'})
          if(lat && lng) {
            await setUserLocation({id: userId, newLocation: {type: 'point', coordinates: [lat, lng]}})
          }
        }

        sendMessage({userId: userId, message: 'refresh user info', data: null})
        for(let friend of userFriends) {
          sendMessage({userId: friend.userId, message: 'refresh user info', data: null})
        }
        return res.status(200).json({ sent: 'alert sent' });
      }
      else {
        throw "no user"
      }
    }
    else {
      throw 'no user'
    }
  } catch(e) {
    console.log(e)

    return res.status(500).json({ error: "internal server error" });
  }
}

exports.sendAlertApp = async(req, res) => {
  try { 
    const user = req.user

    const userFriends =  await getFriends({userId: user})
    const userStatusSuccess = await setUserStatus({id: user, newStatus: 'alert'})
       
    sendMessage({userId: user, message: 'refresh user info', data: null})
    for(let friend of userFriends) {
      sendMessage({userId: friend.userId, message: 'refresh user info', data: null})
    }
    return res.status(200).json({ sent: 'alert sent' });

  } catch(e) {
    console.log(e)

    return res.status(500).json({ error: "internal server error" });
  }
}

exports.disableAlert = async(req, res) => {
  try { 
    const user = req.user
    const userFriends =  await getFriends({userId: user})
    const userStatusSuccess = await setUserStatus({id: user, newStatus: 'idle'})
    const userDisabelAlertSuccess = await setDisableAlertSend({id: user, newDisableAlert: true})

    sendMessage({userId: user, message: 'refresh user info', data: null})
    for(let friend of userFriends) {
      sendMessage({userId: friend.userId, message: 'refresh user info', data: null})
    }
    return res.status(200).json({ success: 'alert disabled' });
  } catch(e) {
    console.log(e)

    return res.status(500).json({ error: "internal server error" });
  }
}

exports.updateLocation = async(req, res) => {
  try { 
    const {
      lat,
      lng,
      deviceId
    } = req.query
    
    const userId = await findDeviceUser({deviceId})

    if(lat && lng) {
      await setUserLocation({id: userId, newLocation: {type: 'point', coordinates: [lat, lng]}})
    }
    return res.status(200).json({ success: "location updated" });

  } catch(e) {
    console.log(e)

    return res.status(500).json({ error: "internal server error" });
  }
}

exports.getFriendInfo = async(req, res) => {
  try { 
    const {
      userId
    } = req.query
    const user = req.user

    const usersAreFriends = await areFriends(userId, user)
    if(usersAreFriends) {
      let friendInfo = await getUserFriendDetailedInfo({id: userId})
      return res.status(200).json({ friend: friendInfo });
    }
    else {
      throw "not friends"
    }

  } catch(e) {
    console.log(e)

    return res.status(500).json({ error: "internal server error" });
  }
}