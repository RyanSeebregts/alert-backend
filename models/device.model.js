const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new mongoose.Schema({
    person: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    deviceId: {type: Schema.Types.Number, required: true}
});

module.exports = mongoose.model('Device', DeviceSchema);

