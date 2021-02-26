const User = require("../models/user");
const jwt = require('jsonwebtoken');
const createError = require('http-errors')
const bcrypt = require('bcrypt');

const saltRounds = 10;
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

function createAccessToken(user) {
    let accessToken = jwt.sign({
        user: {
            "_id": user._id,
            "email": user.email
        }
    }, ACCESS_TOKEN_SECRET, {
        expiresIn: "10m",
    });

    return accessToken;
}

function createRefreshToken(user) {
    let refreshToken = jwt.sign({
        user: {
            "_id": user._id,
            "email": user.email
        }
    },
        REFRESH_TOKEN_SECRET, {
        expiresIn: "30d",
    });

    return refreshToken;
};

module.exports = {
    login: async function (req, res, next) {
        var user = await User.findOne({
            email: req.body.email
        }).select(["_id", "name", "email", "password"]);

        if (user == null || !user.comparePassword(req.body.password)) {
            return next(createError(400, { success: false, message: "invalid user or password" }));
        }

        let accessToken = createAccessToken(user);
        let refreshToken = createRefreshToken(user);

        let tokenDocument = {
            "token": refreshToken,
            "device": req.headers["user-agent"]
        }

        const result = await User.update({
            '_id': user._id,
        }, {
            '$push': {
                'tokens': tokenDocument
            }
        });

        if (result.nModified != 0) {
            user.password = undefined;

            return res.status(200).json(
                {
                    success: true,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    user: user
                }
            );
        } else {
            return next(createError(500, { success: false, message: "login error" }));
        }
    },

    signup: async function (req, res, next) {
        var docs = await User.find({ email: req.body.email });

        if (docs.length) {
            return next(createError(400, { success: false, message: "email already exists" }));
        } else {
            const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);

            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            });

            try {
                let accessToken = createAccessToken(user);
                let refreshToken = createRefreshToken(user);

                let tokenDocument = {
                    "token": refreshToken,
                    "device": req.headers["user-agent"]
                }

                await user.tokens.push(tokenDocument);
                await user.save();

                user.password = undefined;
                user.tokens = undefined;
                user.routes = undefined;

                return res.status(200).json({
                    success: true,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    user: user
                });
            } catch (err) {
                return next(createError(500, { success: false, message: err }));
            }
        }
    },

    refresh_token: async function (req, res, next) {
        const refreshToken = req.body.refresh_token;

        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        const userDoc = await User.findOne({ "_id": payload.user._id })
            .select({ tokens: { $elemMatch: { token: refreshToken } } });

        if (!userDoc) {
            return next(createError(401, { success: false, message: "no token found" }));
        } else {
            const newAccessToken = createAccessToken(userDoc);

            //rotate refresh token
            const newRefreshToken = createRefreshToken(userDoc);

            const result = await User.update({
                '_id': payload.user._id,
                'tokens.token': refreshToken
            }, {
                '$set': {
                    'tokens.$.token': newRefreshToken,
                    "tokens.$.device": req.headers["user-agent"]
                }
            });

            if (result.nModified != 0) {
                return res.status(200).json({ success: true, access_token: newAccessToken, refresh_token: newRefreshToken });
            } else {
                return next(createError(500, { success: false, message: "can't refresh token" }));
            }
        }
    },

    logout: async function (req, res, next) {
        const refresh_token = req.body.refresh_token;

        if (!refresh_token) {
            return next(createError(400, { success: false, message: "refresh token missing" }));
        }

        const payload = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET);

        var result = await User.updateOne({ "_id": payload.user._id }, { $pull: { "tokens": { "token": refresh_token } } })

        if (result.nModified != 0) {
            return res.status(200).json({ success: true });
        } else {
            return next(createError(500, { success: false, message: "can't logout" }));
        }
    }
}