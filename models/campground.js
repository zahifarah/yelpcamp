// include in module
const mongoose = require("mongoose");
const Review = require("./review");

// schema
const CampgroundSchema = new mongoose.Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

// Post Hook Middleware (when this runs the document has already been deleted)
// but that's fine as it's passed in to the hook middleware and we have access to it.
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: { // delete all reviews where the "_id" field exists inside the doc
                $in: doc.reviews // we just deleted, inside it's reviews array.
            }
        })
    }
});

// compile and export model
module.exports = mongoose.model("Campground", CampgroundSchema);
