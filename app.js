// include in module
const express = require("express");
const path = require("path"); // node module, allows customizing file and directory paths
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate"); // engine that parses EJS
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError"); // Extends Error with custom functionality
const methodOverride = require("method-override"); // override GET/POST verbs in HTTP requests
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// import routes
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

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
        httpOnly: true, /* helps mitigate the risk of client side 
        script accessing the protected cookie (if the browser supports it) */
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // supported by IE
        maxAge: 1000 * 60 * 60 * 24 * 7, // not supported by IE but modern way of doing it
    }
};

// USES
app.use(session(sessionConfig)); // session actual use with configuration settings as defined above
app.use(flash()); // use flash(), it's not enough to require it

app.use(passport.initialize());
app.use(passport.session()); // persistant logging session (alternative: log-in on every single request)
// passport-local-mongoose methods
passport.use(new LocalStrategy(User.authenticate())); // new strategy + PLM method
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// LOCALS: accessible in all templates
app.use((req, res, next) => {
    // console.log(req.session); // print entire session to see what's going on
    res.locals.currentUser = req.user; // access deserialized User information via Passport
    res.locals.success = req.flash("success"); // flash access is scoped to every http requests
    res.locals.error = req.flash("error");
    next(); // don't forget calling next() :)
});

// use routes
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

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