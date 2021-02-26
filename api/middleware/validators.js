const { check, validationResult } = require('express-validator');
const createError = require('http-errors')

exports.loginRules = [
    check('email').isEmail(),
    check('password').isLength({ min: 5 })
];

exports.signupRules = [
    check('name').exists(),
    check('email').isEmail(),
    check('password').isLength({ min: 5 })
];

exports.tokenRules = [
    check('refresh_token').exists()
];

exports.updateUserRules = [
    check('name').optional(),
    check('email').optional().isEmail()
];

exports.checkRules = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw createError(400, { message: errors.array()[0].msg + " " + errors.array()[0].param });
    }

    next();
};