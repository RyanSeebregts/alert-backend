const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendRequestSchema = new mongoose.Schema({
    sender: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    receiver: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
  });

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);

