const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");
const validators = require("../middleware/validators");
const routesController = require('../controllers/routes');

router.get("/", routesController.getAll);

router.post("/", authentication.verify, routesController.post);

router.get("/:id", routesController.get);

router.put(
    "/:id",
    authentication.verify,
    routesController.update
);

router.delete(
    "/:id",
    authentication.verify,
    routesController.delete
);

module.exports = router;