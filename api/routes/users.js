const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const validators = require("../middleware/validators");
const userController = require('../controllers/users');

router.get("/", authentication.verify, userController.all);

router.get(
    "/:id",
    authentication.verify,
    userController.getUser
);

router.put(
    "/:id",
    validators.updateUserRules,
    authentication.verify,
    validators.checkRules,
    authorization.userResource,
    userController.putUser
);

router.delete(
    "/:id",
    authentication.verify,
    authorization.userResource,
    userController.deleteUser
);

module.exports = router;