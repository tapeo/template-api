const createError = require('http-errors')

exports.userResource = (req, res, next) => {
    var userFromToken = req.user;

    if (userFromToken._id != req.params.id) {
        throw createError(403, { success: false, message: "resource deny" });
    }

    next();
};