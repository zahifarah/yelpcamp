// include in module
const express = require("express");
const path = require("path"); // node module, allows customizing file and directory paths
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate"); // engine that parses EJS
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError"); // Extends Error with custom functionality
const methodOverride = require("method-override"); // override GET/POST verbs in HTTP requests

// assign routes
const campgrounds = require("./routes/campgrounds") // import and assign campground routes to variable
const reviews = require("./routes/reviews") // import and assign review routes to variable

// MongoDB via Mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true, // (new) URL string parser 
    useCreateIndex: true, // (new) to define indexes in schemas
    useUnifiedTopology: true, // handles monitoring all the servers in a replica set or sharded cluster
    useFindAndModify: false // handle deprecation warning for findAndUpdate() 
});
mongoose.connection.on("error", console.error.bind(console, "connection error:")); // set "this" value to console (via "bind")
mongoose.connection.once("open", () => {
    console.log("Mongoose (27017): \"yelp-camp\" connected.");
});

const app = express();

app.engine("ejs", ejsMate); // set ejsMate as EJS template engine
app.set("view engine", "ejs"); // set ejs as view engine
app.set("views", path.join(__dirname, "views")); // view directory === absolute path ends with /views

app.use(express.urlencoded({ extended: true })); // middleware that parses urlencoded, returns a function
app.use(methodOverride("_method")); // method-override
app.use(express.static(path.join(__dirname, "public"))); // static directory === absolute path ends with /public

// session configuration settings
const sessionConfig = {
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // supported by IE
        maxAge: 1000 * 60 * 60 * 24 * 7, // not supported by IE but modern way of doing it
    }
};
app.use(session(sessionConfig)); // remember to pass the settings - here as sessionConfig variable - on use
app.use(flash()); // use flash(), it's not enough to require it

// flash message middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success"); // flash access is scoped to every http requests
    res.locals.error = req.flash("error");
    next(); // don't forget calling next() :)
});

// use routes
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

// ========================================================================================================================
// HOME (BROKEN)
app.get("/", (req, res) => {
    res.render("home");
});

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