const jwt = require("jsonwebtoken");
const privateKey = process.env.ACCESS_TOKEN_SECRET;
const createError = require('http-errors')

exports.verify = (req, res, next) => {
    const token = req.get("x-auth-token");

    if (!token) {
        throw createError(401, { success: false, message: "no access_token" });
    } else {
        try {
            const payload = jwt.verify(token, privateKey);
            req.user = payload.user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw createError(401, { success: false, message: "access_token expired" });
            } else if (error.name === "JsonWebTokenError") {
                throw createError(401, { success: false, message: "access_token not valid" });
            } else {
                throw createError(401, { success: false, message: error });
            }
        }
    }
};