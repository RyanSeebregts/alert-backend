const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendSchema = new mongoose.Schema({
    person1: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    person2: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
  });

module.exports = mongoose.model('Friend', FriendSchema);

