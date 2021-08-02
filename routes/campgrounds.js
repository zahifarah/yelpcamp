const express = require("express");
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware"); // isLoggedIn() middleware
const catchAsync = require("../utils/catchAsync"); // wrapper function to catch errors and avoid try/catch everywhere

// controllers: objects that contain methods representing the logic for specific routes
const campgrounds = require("../controllers/campgrounds");

// Campground routes are prepended by "/campgrounds"
// INDEX
router.get("/", catchAsync(campgrounds.index));

// NEW
router.get("/new",
    isLoggedIn,
    campgrounds.renderNewForm);

router.post("/",
    isLoggedIn,
    validateCampground,
    catchAsync(campgrounds.createCampground));

// SHOW 
router.get("/:id", catchAsync(campgrounds.showCampground));

// EDIT 
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// DELETE
router.delete("/:id/", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;