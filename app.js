// git init, npm init

// include in module
const express = require("express");
const app = express();
const path = require("path"); // node module, allows customizing file and directory paths
const mongoose = require("mongoose");
const Campground = require("./models/campground"); // import Campground model 
const methodOverride = require("method-override"); // override GET/POST verbs in HTTP requests
const ejsMate = require("ejs-mate"); // engine that parses EJS
const catchAsync = require("./utils/catchAsync"); // wrapper function to catch errors and avoid try/catch everywhere
const ExpressError = require("./utils/ExpressError"); // Extends Error with custom functionality
const { campgroundSchema, reviewSchema } = require("./schemas.js"); // Deconstructing as we'll have multiple schemas in the future
const Review = require("./models/review");

app.engine("ejs", ejsMate); // set ejsMate as EJS template engine
app.set("view engine", "ejs"); // set ejs as view engine
app.set("views", path.join(__dirname, "views")); // view directory === views

app.use(express.urlencoded({ extended: true })); // middleware that parses urlencoded, returns a function
app.use(methodOverride("_method")); // method-override shorthand

// JOI MIDDLEWARE
// Middleware function --> the signature is (req res, next)
const validateCampground = (req, res, next) => {
    // deconstruct {error} on assign + pass data through to JOI schema
    const { error } = campgroundSchema.validate(req.body);
    // check if there's an error property
    if (error) {
        // take details (an array of objects) map over them and return a single new string.
        const msg = error.details.map(el => el.message).join(",");
        // throw an error with the relevant message and status code
        throw new ExpressError(msg, 400);
    } else {
        next();
    };
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // take details (an array of objects) map over them and return a single new string.
        const msg = error.details.map(el => el.message).join(",");
        // throw an error with the relevant message and status code
        throw new ExpressError(msg, 400);
    } else {
        next();
    };
};

// connect to MongoDB via Mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true, // (new) URL string parser 
    useCreateIndex: true, // (new) to define indexes in schemas
    useUnifiedTopology: true // handles monitoring all the servers in a replica set or sharded cluster
});
// mongoose error handling via node
mongoose.connection.on("error", console.error.bind(console, "connection error:")); // set "this" value to console (via "bind")
mongoose.connection.once("open", () => {
    console.log("Mongoose (27017): \"yelp-camp\" connected.");
});

// HOME
app.get("/", (req, res) => {
    res.render("home");
});

// CAMPGROUNDS: INDEX
app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}); // console.log(campgrounds); object inside array
    res.render("campgrounds/index", { campgrounds });
}));

// CAMPGROUNDS: NEW
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
})
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground); // returns {"campground: {"title: "Some Title", "location": "Some location"}"}
    const added = await campground.save();
    console.log(`ADDED: ${added}`);
    res.redirect(`/campgrounds/${campground._id}`);
}));

// CAMPGROUNDS: SHOW DETAILS
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews"); // returns query object
    // console.log(campground); // test if populate works in terminal
    res.render("campgrounds/show", { campground });
}));

// CAMPGROUNDS: EDIT DETAILS
app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id); // find campground by id
    res.render("campgrounds/edit", { campground });
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    console.log(updatedCampground);
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}));

// CAMPGROUNDS: DELETE
app.delete("/campgrounds/:id/", catchAsync(async (req, res) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    console.log(`DELETED: ${deleted}`)
    res.redirect("/campgrounds");
}));

// ========================================================================================================================
// REVIEWS: CREATE
app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // grabs both the rating on slider + text review, both stored in [review]
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// REVIEWS: DELETE
app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // pull (delete) only the target reviewId
    await Review.findByIdAndDelete(reviewId); // will still have a reference of that campground in the array property reviews of campgroundSchema.
    res.redirect(`/campgrounds/${id}`);
}));

// ========================================================================================================================

// ERROR HANDLER: NO MATCH ROUTES
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
});

// GENERAL ERROR HANDLER
app.use((err, req, res, next) => {
    // const { statusCode = 500, message = "Something went wrong." } = err;
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render("error", { err });
});

// SERVER
app.listen(3000, () => {
    console.log("Localhost (3000): listening...")
});