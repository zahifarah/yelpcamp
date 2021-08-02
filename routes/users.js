const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync");

// controllers: objects that contain methods representing the logic for specific routes
const users = require("../controllers/users");

router.route("/register")
    .get(users.renderRegister) // render register form
    .post(catchAsync(users.register)); // post register form

// LOGIN
router.route("/login")
    .get(users.renderLogin) // render login form
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login); // post register form

// LOGOUT
router.get("/logout", users.logout);

module.exports = router;