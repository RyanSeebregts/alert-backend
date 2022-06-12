const router = require("express").Router();
const Middleware = require("../middleware/userMiddleware");
// Require the controllers
const user_controller = require('../controllers/user.controller');

router.post('/sign-up', user_controller.signUp)
router.get('/authorise', Middleware.checkAuth, user_controller.authorise)
router.get('/find-friends', Middleware.checkAuth, user_controller.findFriends)
router.get('/get-user-info', Middleware.checkAuth, user_controller.getUserInfo)
router.get('/send-alert', user_controller.sendAlert)
router.get('/update-location', user_controller.updateLocation)
router.get('/get-friend-info', Middleware.checkAuth, user_controller.getFriendInfo)

router.post('/send-alert-app', Middleware.checkAuth, user_controller.sendAlertApp)
router.post('/disable-alert', Middleware.checkAuth, user_controller.disableAlert)
router.post('/send-friend-request', Middleware.checkAuth, user_controller.sendFriendRequest)
router.post('/delete-friend-request', Middleware.checkAuth, user_controller.deleteFriendRequest)

router.post('/accept-friend', Middleware.checkAuth, user_controller.acceptFriendRequest)
router.post('/delete-friend', Middleware.checkAuth, user_controller.deleteFriend)

module.exports = router;