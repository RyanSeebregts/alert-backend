const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    firebaseUID: {type: String, required: true, max: 100},

    fullName: {type: String, required: true, max: 100},
    email: {type: String, required: true, max: 100},

    dateOfBirth: {type: Date, required: true},

    lastLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      }, 
      required: false
    },
    currentStatus: {type: String, required: true, max: 30}
  });

module.exports = mongoose.model('User', UserSchema);

