const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware"); // isLoggedIn() middleware
const catchAsync = require("../utils/catchAsync"); // wrapper function to catch errors and avoid try/catch everywhere

// controllers: objects that contain methods representing the logic for specific routes
const reviews = require("../controllers/reviews");

// Review routes are prepended by "/campgrounds/:id/reviews"
// REVIEWS: CREATE
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// REVIEWS: DELETE
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;