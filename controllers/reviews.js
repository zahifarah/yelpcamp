const Campground = require("../models/campground"); // import Campground model 
const Review = require("../models/review"); // import Review model 

// CREATE NEW REVIEW
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); // grabs both the rating on slider + text review, both stored in [review]
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review added :)");
    res.redirect(`/campgrounds/${campground._id}`);
};

// DELETE
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // pull (delete) only the target reviewId
    await Review.findByIdAndDelete(reviewId); // will still have a reference of that campground in the array property reviews of campgroundSchema.
    req.flash("success", "Review deleted!");
    res.redirect(`/campgrounds/${id}`);
};