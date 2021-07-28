const express = require("express");
const router = express.Router();
const User = require("../models/user")

router.get("/register", (req, res) => {
    res.render("users/register");
});

router.post("/register", async (req, res) => {
    const { username, password, email } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.flash("success", "Welcome to Yelp Camp!");
    res.redirect("/campgrounds");
});

module.exports = router;