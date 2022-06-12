const Device = require("../models/device.model");

exports.findDeviceUser = async ({deviceId}) => {
    try {
        const device = await Device.findOne({deviceId: deviceId})
        if(device.person)
            return device.person

        return {error: 'error'}
    } catch(e) {
        console.log(e)
        return {error: 'error'}
    }
}
