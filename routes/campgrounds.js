const express = require("express");
const router = express.Router();
const Campground = require("../models/campground"); // import Campground model 
const { campgroundSchema } = require('../schemas.js'); // JOI schema (contains campgroundSchema and reviewSchema)

const catchAsync = require("../utils/catchAsync"); // wrapper function to catch errors and avoid try/catch everywhere
const ExpressError = require("../utils/ExpressError"); // Extends Error with custom functionality

// JOI VALIDATION MIDDLEWARE
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); // deconstruct {error} on assign + pass data through to JOI schema
    if (error) {  // check if there's an error property
        const msg = error.details.map(el => el.message).join(","); // take details (an array of objects) map over them and return a single new string.
        throw new ExpressError(msg, 400); // throw an error with the relevant message and status code
    } else {
        next();
    };
};

// PREPENDED BY "/campgrounds"
// CAMPGROUNDS: INDEX
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}); // console.log(campgrounds); object inside array
    res.render("campgrounds/index", { campgrounds });
}));

// CAMPGROUNDS: NEW
router.get("/new", (req, res) => {
    res.render("campgrounds/new");
})

router.post("/", validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground); // returns {"campground: {"title: "Some Title", "location": "Some location"}"}
    const added = await campground.save();
    req.flash("success", "New Campground successfully created!");
    console.log(`ADDED: ${added}`);
    res.redirect(`/campgrounds/${campground._id}`);
}));

// CAMPGROUNDS: SHOW DETAILS
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews"); // returns query object
    // console.log(campground); // test if populate works in terminal
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}));

// CAMPGROUNDS: EDIT DETAILS
router.get("/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id); // find campground by id
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}));

router.put("/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    req.flash("success", "Successfully updated campground!");
    console.log("UPDATED CAMPGROUND!")
    console.log(updatedCampground);
    res.redirect(`/campgrounds/${updatedCampground._id}`);
}));

// CAMPGROUNDS: DELETE
router.delete("/:id/", catchAsync(async (req, res) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    console.log(`DELETED: ${deleted}`)
    req.flash("success", "Campground deleted!");
    res.redirect("/campgrounds");
}));

module.exports = router;