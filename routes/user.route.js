const router = require("express").Router();
const Middleware = require("../middleware/userMiddleware");
// Require the controllers
const user_controller = require('../controllers/user.controller');

router.post('/sign-up', user_controller.signUp)
router.get('/authorise', Middleware.checkAuth, user_controller.authorise)


module.exports = router;