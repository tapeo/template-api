const Route = require("../models/route");
const createError = require('http-errors')
const jwt = require("jsonwebtoken");
const privateKey = process.env.ACCESS_TOKEN_SECRET;

const userField = ["_id", "name", "email"];

// TODO anonymous requests limit rate

module.exports = {
    getAll: async function (req, res, next) {
        const token = req.get("x-auth-token");

        if (token) {
            try {
                const payload = jwt.verify(token, privateKey);

                if (payload) {
                    const users = await Route.find().populate("user", userField);
                    return res.json({ success: true, routes: users });
                }
            } catch (e) {
            }
        }

        const users = await Route.find().populate("user", ["_id", "name"]);
        return res.json({ anonymous: true, success: true, routes: users });
    },

    get: async function (req, res, next) {
        const token = req.get("x-auth-token");

        if (token) {
            try {
                const payload = jwt.verify(token, privateKey);

                if (payload) {
                    var route = await Route.findById(req.params.id).populate("user", userField);

                    if (route == null) {
                        return next(createError(404, { success: false, message: "route not found" }));
                    }

                    return res.json({ success: true, "route": route });
                }
            } catch (e) {
            }
        }

        var route = await Route.findById(req.params.id).populate("user", ["_id", "name"]);

        if (route == null) {
            return next(createError(404, { success: false, message: "route not found" }));
        }

        return res.json({ anonymous: true, success: true, "route": route });
    },

    post: async function (req, res, next) {
        const route = new Route({
            name: req.body.name,
            image_url: req.body.image_url,
            description: req.body.description,
            distance: req.body.distance,
            veichle_types: req.body.veichle_types,
            user: req.user._id,
            overview_polyline: req.body.overview_polyline,
            waypoints: req.body.waypoints
        });

        await route.save();

        return res.status(200).json(
            { success: true, route: route }
        );
    },

    update: async function (req, res, next) {
        let route = await Route.findById(req.params.id).populate("user", "_id");

        if (route == null) {
            return next(createError(404, { success: false, message: "route not found" }));
        }

        if (route.user._id != req.user._id) {
            throw createError(403, { success: false, message: "resource route deny" });
        }

        if (req.body.name) {
            route.name = req.body.name;
        }

        if (req.body.image_url) {
            route.image_url = req.body.image_url;
        }

        if (req.body.description) {
            route.description = req.body.description;
        }

        if (req.body.veichle_types) {
            route.veichle_types = req.body.veichle_types;
        }

        const result = await route.save();

        if (result.nModified != 0) {
            return res.status(200).json({ success: true, "route": route });
        } else {
            return next(createError(500, { success: false, message: "can't update route" }));
        }
    },

    delete: async function (req, res, next) {
        let route = await Route.findById(req.params.id).populate("user", "_id");

        if (route == null) {
            return next(createError(404, { success: false, message: "route not found" }));
        }

        if (route.user._id != req.user._id) {
            throw createError(403, { success: false, message: "resource route deny" });
        }

        const result = await Route.remove({ _id: req.params.id });

        if (result.deletedCount != 0) {
            return res.json({ success: true });
        } else {
            return next(createError(500, { success: false, message: "can't delete route" }));
        }
    }
}