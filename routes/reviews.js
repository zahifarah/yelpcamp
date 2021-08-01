const express = require("express");
const router = express.Router({ mergeParams: true });

const Campground = require("../models/campground"); // import Campground model 
const Review = require("../models/review"); // import Review model 
const { validateReview, isLoggedIn } = require("../middleware"); // isLoggedIn() middleware
const catchAsync = require("../utils/catchAsync"); // wrapper function to catch errors and avoid try/catch everywhere

// PREPENDED BY "/campgrounds/:id/reviews"
// REVIEWS: CREATE
router.post("/", isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // grabs both the rating on slider + text review, both stored in [review]
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review added :)");
    res.redirect(`/campgrounds/${campground._id}`);
}));

// REVIEWS: DELETE
router.delete("/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // pull (delete) only the target reviewId
    await Review.findByIdAndDelete(reviewId); // will still have a reference of that campground in the array property reviews of campgroundSchema.
    req.flash("success", "Review deleted!");
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;