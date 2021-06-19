// git init, npm init

// include in module
const express = require("express");
const app = express();
const path = require("path"); // node module, allows customizing file and directory paths
const mongoose = require("mongoose");
const Campground = require("./models/campground"); // import Campground model 
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // engine that parses EJS

app.engine("ejs", ejsMate); // set ejsMate as EJS template engine
app.set("view engine", "ejs"); // set ejs as view engine
app.set("views", path.join(__dirname, "views")); // view directory === views

app.use(express.urlencoded({ extended: true })); // middleware that parses urlencoded, returns a function
app.use(methodOverride("_method")); // method-override shorthand

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
    const campgrounds = await Campground.find({}); // console.log(campgrounds); object inside array
    res.render("campgrounds/index", { campgrounds });
});

// NEW CAMPGROUND
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
})
app.post("/campgrounds", async (req, res) => {
    const campground = new Campground(req.body.campground); // requires urlencoded middleware
    // returns {"campground: {"title: "Some Title", "location": "Some location"}"}
    const added = await campground.save();
    console.log(`Added: ${added}`);
    res.redirect(`/campgrounds/${campground._id}`);
});

// CAMPGROUND DETAILS
app.get("/campgrounds/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id); // returns query object
    res.render("campgrounds/show", { campground });
});

// UPDATE/EDIT CAMPGROUND
app.get("/campgrounds/:id/edit", async (req, res) => {
    const campground = await Campground.findById(req.params.id); // find campground by id
    res.render("campgrounds/edit", { campground });
});
app.put("/campgrounds/:id", async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    console.log(updatedCampground);
    res.redirect(`/campgrounds/${updatedCampground._id}`);
});

// DELETE CAMPGROUND
app.delete("/campgrounds/:id/", async (req, res) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    console.log(`Deleted: ${deleted}`)
    res.redirect("/campgrounds");
});