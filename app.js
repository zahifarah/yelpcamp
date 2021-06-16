// git init, npm init

// include in module
const express = require("express");
const app = express();
const path = require("path"); // node module, allows customizing file and directory paths
const mongoose = require("mongoose");
const Campground = require("./models/campground"); // import Campground model 

app.set("view engine", "ejs"); // set ejs as view engine
app.set("views", path.join(__dirname, "views")); // view directory === views

// connect to MongoDB via Mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true, // (new) URL string parser 
    useCreateIndex: true, // (new) to define indexes in schemas
    useUnifiedTopology: true // handles monitoring all the servers in a replica set or sharded cluster
});
// mongoose error handling via node
mongoose.connection.on("error", console.error.bind(console, "connection error:")); // set "this" value to console (via "bind")
mongoose.connection.once("open", () => {
    console.log("Mongoose (27017): MongoDB connected.");
});

// http server
app.listen(3000, () => {
    console.log("Localhost (3000): listening...")
});

// HOME
app.get("/", (req, res) => {
    res.render("home");
});

// CAMPGROUNDS INDEX
app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

// NEW CAMPGROUND
// (A) GET route
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
})

// (B) POST async route

// CAMPGROUND DETAILS
app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
});





