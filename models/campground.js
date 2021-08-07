// include in module
const mongoose = require("mongoose");
const Review = require("./review");

// reference/example link
// https://res.cloudinary.com/cloud-yelp/image/upload/w_300/v1628144514/YelpCamp/udzdfuejl2naphba3pxi.jpg 

const ImageSchema = new mongoose.Schema({
    url: String,
    filename: String
});

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_300");
});

// campground schema
const CampgroundSchema = new mongoose.Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
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
