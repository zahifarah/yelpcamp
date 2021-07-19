const express = require("express");
const router = express.Router({ mergeParams: true });

const Campground = require("../models/campground"); // import Campground model 
const Review = require("../models/review"); // import Review model 

const { reviewSchema } = require('../schemas.js'); // JOI schema

const ExpressError = require("../utils/ExpressError"); // Extends Error with custom functionality
const catchAsync = require("../utils/catchAsync"); // wrapper function to catch errors and avoid try/catch everywhere

// JOI VALIDATION
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(","); // take details (an array of objects) map over them and return a single new string.
        throw new ExpressError(msg, 400); // throw an error with the relevant message and status code
    } else {
        next();
    };
};

// REVIEWS: CREATE
router.post("/", validateReview, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // grabs both the rating on slider + text review, both stored in [review]
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// REVIEWS: DELETE
router.delete("/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // pull (delete) only the target reviewId
    await Review.findByIdAndDelete(reviewId); // will still have a reference of that campground in the array property reviews of campgroundSchema.
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;