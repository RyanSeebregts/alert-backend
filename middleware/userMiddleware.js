const firebaseAdmin = require('firebase-admin');
const User = require("../models/user.model");

//middleware function to check if the incoming request in authenticated:
exports.checkAuth = async (req, res, next) => {
  // get the token stored in the custom header called 'x-auth-token'
  const token = req.get("x-auth-token");
  //send error message if no token is found:
  if (!token) {
    return res.status(401).json({ error: "access denied" });
  } 
  else {
    try {
      const response = await firebaseAdmin.auth().verifyIdToken(token)

      const uid = response.uid;

      const user = await User.findOne({firebaseUID: uid}).lean()
      if(user) {
          req.user = user._id.toHexString()
          next()
      }

      else {
          return res.status(401).json({ error: "token not valid" });
      }
    }catch(e) {
        console.log(e)

        return res
          .status(401)
          .json({ error: "token not valid" });    }
  }
};