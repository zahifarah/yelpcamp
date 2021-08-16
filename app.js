// dotenv
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
};

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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require('connect-mongo');

// MongoDB Atlas
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

// import routes
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

// MongoDB via Mongoose
mongoose.connect(dbUrl, {
    useNewUrlParser: true, // (new) URL string parser 
    useCreateIndex: true, // (new) to define indexes in schemas
    useUnifiedTopology: true, // handles monitoring all the servers in a replica set or sharded cluster
    useFindAndModify: false // handle deprecation warning for findAndUpdate() 
});
mongoose.connection.on("error", console.error.bind(console, "connection error:")); // set "this" value to console (via "bind")
mongoose.connection.once("open", () => {
    console.log("Connected to: " + dbUrl);
});

const app = express();

app.engine("ejs", ejsMate); // set ejsMate as EJS template engine
app.set("view engine", "ejs"); // set ejs as view engine
app.set("views", path.join(__dirname, "views")); // view directory === absolute path ends with /views

app.use(express.urlencoded({ extended: true })); // middleware that parses urlencoded, returns a function
app.use(methodOverride("_method")); // method-override
app.use(express.static(path.join(__dirname, "public"))); // static directory === absolute path ends with /public
app.use(mongoSanitize({
    replaceWith: "_"
}));

const secret = process.env.SECRET || "dolphin"

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: "dolphin"
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

// session configuration settings
const sessionConfig = {
    store: store,
    name: "sesh",
    secret: "dolphin",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, /* helps mitigate the risk of client side 
        script accessing the protected cookie (if the browser supports it) */
        // secure: true, /* cookies can only be configured over secure connections, i.e. HTTPS (localhost is NOT HTTPS) */
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // supported by IE
        maxAge: 1000 * 60 * 60 * 24 * 7, // not supported by IE but modern way of doing it
    }
};

// USES
app.use(session(sessionConfig)); // session actual use with configuration settings as defined above
app.use(flash()); // use flash(), it's not enough to require it
app.use(helmet()); // will use all 11 middleware within Helmet, except contentSecurityPolicy

// HELMET DIRECTIVES
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net", // bootstrap 5
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/cloud-yelp/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session()); // persistant logging session (alternative: log-in on every single request)
// passport-local-mongoose methods
passport.use(new LocalStrategy(User.authenticate())); // new strategy + PLM method
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// LOCALS middleware: accessible in all templates
app.use((req, res, next) => {
    // console.log(req.session); // print entire session to see what's going on
    console.log(req.query);
    res.locals.currentUser = req.user; // access deserialized User information via Passport
    res.locals.success = req.flash("success"); // flash access is scoped to every http requests
    res.locals.error = req.flash("error");
    next(); // don't forget calling next() :)
});

// ROUTES
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// ========================================================================================================================
// HOME
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