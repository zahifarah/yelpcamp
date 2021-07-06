// include in module
const mongoose = require("mongoose");

// schema
const CampgroundSchema = new mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

// compile and export model
module.exports = mongoose.model("Campground", CampgroundSchema);
