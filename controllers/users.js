const User = require("../models/user")

// REGISTER
module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};

module.exports.register = async (req, res) => {
    try { // where errors are likely to happen
        const { username, password, email } = req.body;
        const user = new User({ username, email }); // create new user
        const registeredUser = await User.register(user, password); // register new user
        req.login(registeredUser, err => { // login user (requires a callback, cannot await it)
            if (err) return next(err);
        });
        console.log(registeredUser);
        req.flash("success", "Welcome to Yelp Camp!");
        res.redirect("/campgrounds");
    }
    catch (error) { // catch, flash and redirect
        req.flash("error", error.message);
        res.redirect("register");
    };
};

// LOGIN
module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || "/campgrounds";
    req.flash("success", "Login successful! Welcome back :)");
    res.redirect(`${redirectUrl}`);
};

// LOGOUT
module.exports.logout = (req, res) => {
    req.logout();
    req.flash("success", "Goodbye 👋");
    res.redirect("/campgrounds");
};