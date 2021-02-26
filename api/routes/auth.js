const express = require("express");
const router = express.Router();
const authController = require('../controllers/auth');
const authentication = require("../middleware/authentication");
const validators = require("../middleware/validators");

router.post(
    "/login", [
    validators.loginRules,
    validators.checkRules,
], authController.login);

router.post(
    "/signup", [
    validators.signupRules,
    validators.checkRules,
], authController.signup);

router.post(
    "/logout",
    validators.tokenRules,
    authentication.verify,
    validators.checkRules,
    authController.logout
);

router.post("/refresh_token",
    validators.tokenRules,
    validators.checkRules,
    authController.refresh_token);

module.exports = router;