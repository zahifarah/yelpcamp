const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    body: String,
    rating: Number,
});

// One-to-Many relationship
// embed an array of objectId's in each campground, reason for that is because we could theoretically
// have thousands of reviews for some campgrounds. 

module.exports = mongoose.model("Review", reviewSchema);