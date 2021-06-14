// include in module
const mongoose = require("mongoose");

// schema
const CampgroundSchema = new mongoose.Schema({
    title: String,
    price: String,
    description: String,
    location: String
});

// compile model + export
module.exports = mongoose.model("Campground", CampgroundSchema);
