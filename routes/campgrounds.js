const express = require("express");
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware"); // isLoggedIn() middleware
const catchAsync = require("../utils/catchAsync"); // wrapper function to catch errors and avoid try/catch everywhere

// controllers: objects that contain methods representing the logic for specific routes
const campgrounds = require("../controllers/campgrounds");

// Campground routes are prepended by "/campgrounds"

router.route("/")
    .get(catchAsync(campgrounds.index)) // index
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)); // new campground

router.get("/new", isLoggedIn, campgrounds.renderNewForm); /* this should come before the show page,
otherwise it will be confused by the runtime as an :id */

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground)) // show page
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground)) // update campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); // delete campground

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)); // edit campground

module.exports = router;