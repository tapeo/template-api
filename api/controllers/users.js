const User = require("../models/user");
const createError = require('http-errors')
const Route = require("../models/route");

const userResourceFilter = ["name", "email", "created_at", "routes"];

module.exports = {
    all: async function (req, res, next) {
        const users = await User.find().populate('routes').select(userResourceFilter);
        return res.json({ success: true, users: users });
    },

    getUser: async function (req, res, next) {
        if (req.user._id == req.params.id) {
            user = await User.findById(req.params.id).populate({ path: 'user.routes', model: Route });
        } else {
            user = await User.findById(req.params.id).populate('routes').select(userResourceFilter);
        }

        if (user == null) {
            return next(createError(404, { success: false, message: "user not found" }));
        }

        return res.json({ success: true, "user": user });
    },

    putUser: async function (req, res, next) {
        let user = await User.findById(req.params.id);

        if (user == null) {
            return next(createError(404, { success: false, message: "user not found" }));
        }

        if (req.body.email) {
            user.email = req.body.email;
        }

        if (req.body.name) {
            user.name = req.body.name;
        }

        const result = await user.save();

        if (result.nModified != 0) {
            return res.status(200).json({ success: true, "user": user });
        } else {
            return next(createError(500, { success: false, message: "can't update user" }));
        }
    },

    deleteUser: async function (req, res, next) {
        var user = await User.findById(req.params.id);

        if (user == null) {
            return next(createError(404, { success: false, message: "user not found" }));
        }

        const result = await User.remove({ _id: req.params.id });

        if (result.deletedCount != 0) {
            return res.json({ success: true });
        } else {
            return next(createError(500, { success: false, message: "can't delete user" }));
        }
    }
}