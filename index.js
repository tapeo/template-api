require('dotenv').config();
require('express-async-errors');

const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const cors = require('cors');
const createError = require('http-errors')

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors());

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
mongoose.connection.on('error', function (err) {
    console.log(err);
});

app.use("/auth", require("./api/routes/auth"));
app.use("/user", require("./api/routes/users"));
app.use("/route", require("./api/routes/routes"));

app.use((error, req, res, next) => {
    if (!error.status) error.status = 500;

    res.status(error.status);

    console.log(error);

    if (process.env.NODE_ENV == "production") {
        res.json({
            success: false,
            error: error.message
        });
    } else {
        res.json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

app.use((req, res, next) => {
    return res.json(createError(404, { success: false, message: "api not found" }));
});

const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 8080;

app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
