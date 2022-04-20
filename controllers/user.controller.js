const User = require("../models/user.model");
const firebaseAdmin = require('firebase-admin');
const { createUser, getUserAuth, setUserStatus } = require('../databaseFunctions/user')
exports.authorise = async (req, res) => {
  try {
    const user = req.user
    console.log(user)
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
