const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground"); // import Campground model 
const { campgroundSchema, reviewSchema } = require("./schemas.js"); // JOI schema, required to run validateCampground

// login middleware
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

// campground author
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to do that.");
        return res.redirect(`/campgrounds/${id}`); // make sure to return
    }
    next(); // don't forget this :)
};

// campground JOI-based validation
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); // deconstruct {error} on assign + pass data through to JOI schema
    if (error) {  // check if there's an error property
        const msg = error.details.map(el => el.message).join(","); // take details (an array of objects) map over them and return a single new string.
        throw new ExpressError(msg, 400); // throw an error with the relevant message and status code
    } else {
        next();
    };
};

// reviews JOI-based validation
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(","); // take details (an array of objects) map over them and return a single new string.
        throw new ExpressError(msg, 400); // throw an error with the relevant message and status code
    } else {
        next();
    };
};
