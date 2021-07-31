module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // stores the originalUrl in session
        req.flash("error", "You must login first!");
        return res.redirect("/login"); /** without the return keyword the function
        would keep running, calling next after sending a response. In an HTTP request
        that doesn't work, you can only send a response once and once only. */
    }
    next();
};

